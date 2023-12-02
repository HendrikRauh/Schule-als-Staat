using Emgu.CV;
using Emgu.CV.CvEnum;
using Emgu.CV.Structure;
using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.IO.Ports;
using System.Linq;
using System.Management;
using System.Media;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using ZXing;
using ZXing.Common;

namespace schule_als_staat_qr_scanner
{
    public partial class MainWindow : Window
    {
        // Server related variables
        private readonly string serverUrl = "http://localhost:3000";
        HttpClient client = new HttpClient();

        // DLL Imports for keyboard hook and module handling
        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        // Constants for keyboard hook and camera settings
        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        private const int cameraFps = 30;
        private int cameraIndex = 0;

        // Sound Players for different states
        private readonly SoundPlayer soundPlayerError = new SoundPlayer(Properties.Resources.sound_error);
        private readonly SoundPlayer soundPlayerMaintenance = new SoundPlayer(Properties.Resources.sound_maintenance);
        private readonly SoundPlayer soundPlayerOk = new SoundPlayer(Properties.Resources.sound_ok);

        // Colors for different states
        private readonly System.Windows.Media.Brush colorError = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#450c0f");
        private readonly System.Windows.Media.Brush colorMaintenance = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#5c4a00");
        private readonly System.Windows.Media.Brush colorNormal = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#303133");
        private readonly System.Windows.Media.Brush colorOk = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#113a1b");

        // Timer controlling the camera frame rate
        private readonly System.Timers.Timer timer = new System.Timers.Timer() { Interval = 1000 / cameraFps, Enabled = true };

        // Salt for Hashing in the QR Code validation
        private readonly string salt = Encoding.UTF8.GetString(Properties.Resources.salt);

        // Keyboard hook delegate
        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

        // Keyboard hook variables
        private static LowLevelKeyboardProc _proc = HookCallback;
        private static IntPtr _hookID = IntPtr.Zero;

        // Variables for application state and QR code scanning
        private DateTime lastScanTime = DateTime.MinValue;
        private VideoCapture capture;
        private bool isFullScreen = false;
        private string lastQrCode;

        private bool Error = false;

        private SerialPort _serialPort;

        public MainWindow()
        {
            InitializeComponent();
            InitializeComponents();
            this.Closing += MainWindow_Closing;
            this.KeyDown += MainWindow_KeyDown;
        }

        private async void ConnectToArduino()
        {
            if (_serialPort != null && !_serialPort.IsOpen)
            {
                CancellationTokenSource cts = new CancellationTokenSource();
                CancellationToken token = cts.Token;

                Task task = Task.Run(() =>
                {
                    try
                    {
                        _serialPort.Open();
                        _serialPort.DataReceived += SerialPort_DataReceived;
                        Dispatcher.Invoke(() =>
                        {
                            TextBlockArduinoStatus.Text = "[A]: Disconnect Arduino";
                            RadioButtonsLocked(true);
                        });
                        _serialPort.WriteLine("connected");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.ToString());
                        Dispatcher.Invoke(() =>
                        {
                            TextBlockArduinoStatus.Text = "[A]: Connect Arduino";
                            RadioButtonsLocked(false);
                        });
                        if (_serialPort.IsOpen)
                        {
                            _serialPort.Close();
                        }
                    }
                }, token);

                if (await Task.WhenAny(task, Task.Delay(500)) == task)
                {
                    // task completed within timeout
                }
                else
                {
                    // timeout logic
                    cts.Cancel();
                    TextBlockArduinoStatus.Text = "[A]: Connect Arduino";
                    RadioButtonsLocked(false);
                    if (_serialPort.IsOpen)
                    {
                        _serialPort.Close();
                    }
                }
            }
        }

        private void ComboBoxSerialPorts_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (RadioButtonPanel.Children.OfType<RadioButton>().Any(rb => rb.IsChecked == true))
            {
                string selectedPort = RadioButtonPanel.Children.OfType<RadioButton>().FirstOrDefault(rb => rb.IsChecked == true)?.Content.ToString();
                _serialPort = new SerialPort(selectedPort);
            }
        }

        private void UpdateComPorts()
        {
            var allPorts = SerialPort.GetPortNames().ToList();
            using (var searcher = new ManagementObjectSearcher("SELECT * FROM WIN32_SerialPort"))
            {
                var namedPorts = searcher.Get().OfType<ManagementBaseObject>().Select(p => p["DeviceID"].ToString()).ToList();
                var unnamedPorts = allPorts.Except(namedPorts).ToList();
                if (unnamedPorts.Count > 0)
                {
                    // unnamedPorts[0] is likely the port you're looking for
                    _serialPort = new SerialPort(unnamedPorts[0]);
                }
        
                // Clear existing RadioButtons
                RadioButtonPanel.Children.Clear();
        
                // Create a RadioButton for each port
                foreach (var port in allPorts)
                {
                    var radioButton = new RadioButton
                    {
                        Content = port,
                        GroupName = "SerialPorts"
                    };
                    radioButton.Checked += RadioButtonPort_Checked;
                    RadioButtonPanel.Children.Add(radioButton);
        
                    // Check the RadioButton if it corresponds to a different COM port
                    if (unnamedPorts.Contains(port))
                    {
                        radioButton.IsChecked = true;
                    }
                }
            }
        }

        private void SerialPort_DataReceived(object sender, SerialDataReceivedEventArgs e)
        {
            SerialPort sp = (SerialPort)sender;
            string indata = sp.ReadExisting().Trim(); // Trim to remove leading/trailing white spaces
            Console.WriteLine($"Data Received from Arduino: {indata}");
            if (indata == "wakeUp")
            {
                systemWakeUp();
            }
            else if (indata == "sleep")
            {
                systemSleep();
            }
        }

        private void systemWakeUp()
        {
            // Code to activate the camera and start scanning
        }

        private void systemSleep()
        {
            // Code to deactivate the camera and stop scanning
        }

        private void DisconnectFromArduino()
        {
            if (_serialPort != null && _serialPort.IsOpen)
            {
                try
                {
                    _serialPort.WriteLine("closing");
                    _serialPort.Close();
                }
                catch (Exception)
                {
                    TextBlockArduinoStatus.Text = "[A]: Connect Arduino";
                }
                finally
                {
                    TextBlockArduinoStatus.Text = "[A]: Connect Arduino";
                    RadioButtonsLocked(false);
                }
            }
        }

        private void RadioButtonPort_Checked(object sender, RoutedEventArgs e)
        {
            RadioButton radioButton = sender as RadioButton;
            if (radioButton != null)
            {
                string selectedPort = radioButton.Content.ToString();
                _serialPort = new SerialPort(selectedPort);
            }
        }

        private void RadioButtonsLocked(bool locked)
        {
            foreach (RadioButton radioButton in RadioButtonPanel.Children)
            {
                radioButton.IsEnabled = !locked;
            }
        }

        private void ChangeArduinoConnectionState()
        {
            if (_serialPort != null && _serialPort.IsOpen)
            {
                DisconnectFromArduino();
            }
            else
            {
                ConnectToArduino();
            }
        }

        // Initialize camera and timer
        private void InitializeComponents()
        {
            capture = new VideoCapture(cameraIndex);
            timer.Elapsed += Timer_Tick;
            UpdateComPorts();
        }

        // Timer Tick event handling
        private async void Timer_Tick(object sender, ElapsedEventArgs e)
        {
            try
            {
                var frame = capture.QueryFrame();
                if (frame == null)
                {
                    return;
                }
                var flippedFrame = new Mat();
                CvInvoke.Flip(frame, flippedFrame, FlipType.Horizontal);
                var bitmap = flippedFrame.ToImage<Bgr, byte>().ToBitmap();
                var memoryStream = new MemoryStream();
                bitmap.Save(memoryStream, ImageFormat.Bmp);

                await Dispatcher.InvokeAsync(() =>
                {
                    ImageCamera.Source = BitmapFrame.Create(memoryStream);
                    TextCurrentTime.Text = DateTime.Now.ToLongTimeString();
                    TextCurrentDate.Text = DateTime.Now.ToLongDateString();
                });

                string qrcode = await Task.Run(() => FindQrCodeInImage(bitmap));
                if (!string.IsNullOrEmpty(qrcode))
                {
                    if (qrcode != lastQrCode)
                    {
                        lastQrCode = qrcode;
                        lastScanTime = DateTime.Now;

                        await Dispatcher.InvokeAsync(async () =>
                        {
                            if (IsCodeValid(qrcode))
                            {
                                Console.WriteLine($"Checking QR, locally valid: {qrcode}");
                                string[] parts = qrcode.Split(',');
                                long unixTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                                string id = parts[3];

                                // bool isValid = await ValidateWithServer(id, unixTime);
                                bool isValid = true;

                                if (isValid)
                                {
                                    _serialPort.WriteLine("inout");
                                    await PlaySoundAndChangeBackground(soundPlayerOk, colorOk);
                                    if (parts.Length >= 2)
                                    {
                                        string name = parts[0] + " " + parts[1];
                                        TextData.Text = name;
                                        TextDataTime.Text = $"{DateTime.Now.ToShortDateString()} - {DateTime.Now.ToLongTimeString()}";
                                    }
                                }
                                else
                                {
                                    _serialPort.WriteLine("error");
                                    await PlaySoundAndChangeBackground(soundPlayerError, colorError);
                                }
                            }

                            else
                            {
                                if (qrcode.Contains("Sesam öffne dich"))
                                {
                                    ToggleFullScreen();
                                }
                                else
                                {
                                    _serialPort.WriteLine("error");
                                    Console.WriteLine($"Invalid QR Code: {qrcode}");
                                    await PlaySoundAndChangeBackground(soundPlayerError, colorError);
                                }
                            }
                        });
                    }
                    else
                    {
                        lastScanTime = DateTime.Now;
                    }
                }
                else
                {
                    if (DateTime.Now - lastScanTime > TimeSpan.FromSeconds(3))
                    {
                        if (lastQrCode != null)
                        {
                            lastQrCode = null;
                            await Dispatcher.InvokeAsync(async () =>
                            {
                                await PlaySoundAndChangeBackground(null, colorNormal);
                            });
                        }
                    }
                }
                Error = false;
            }
            catch (Emgu.CV.Util.CvException)
            {
                Error = true;
            }
            Dispatcher.Invoke(() =>
                    {
                        if (Error)
                        {
                            ErrorCircle.Visibility = Visibility.Visible;
                        }
                        else
                        {
                            ErrorCircle.Visibility = Visibility.Hidden;
                        }
                    });
        }

        // QR Code scanning and validation methods
        private string FindQrCodeInImage(Bitmap bitmap)
        {
            var luminanceSource = new BitmapLuminanceSource(bitmap);
            var binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
            var result = new MultiFormatReader().decode(binaryBitmap);

            return result == null ? null : result.Text;
        }

        private bool IsCodeValid(string idCardString)
        {
            string[] parts = idCardString.Split(',');
            if (parts.Length != 4)
            {
                return false;
            }

            string firstName = parts[0];
            string surname = parts[1];
            string className = parts[2];
            string hash = parts[3];

            string expectedHash = GenerateSHA256Hash($"{firstName}{salt}{surname}{salt}{className}");
            return expectedHash == hash;
        }

        private async Task<bool> ValidateWithServer(string id, long unixTime)
        {
            string url = $"{serverUrl}/attendance/change-attendance.js";
            var payload = new { time = unixTime, id = id };
            string jsonPayload = System.Text.Json.JsonSerializer.Serialize(payload);

            Console.WriteLine($"Sending POST request to {url} with payload {jsonPayload}");

            HttpContent content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                HttpResponseMessage response = await client.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    string responseBody = await response.Content.ReadAsStringAsync();
                    await PlaySoundAndChangeBackground(soundPlayerOk, colorOk);
                    return true;
                }
                else
                {
                    Console.WriteLine($"POST request failed with status code: {response.StatusCode}");
                    await PlaySoundAndChangeBackground(soundPlayerError, colorError);
                    return false;
                }
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"POST request failed with exception: {ex.Message}");
                Console.WriteLine($"This might be because the server was not reachable.");
                await PlaySoundAndChangeBackground(soundPlayerError, colorError);
                return false;
            }
        }

        public string GenerateSHA256Hash(string input)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = Encoding.UTF8.GetBytes(input);
                byte[] hash = sha256.ComputeHash(bytes);
                StringBuilder result = new StringBuilder();
                for (int i = 0; i < hash.Length; i++)
                {
                    result.Append(hash[i].ToString("x2"));
                }
                return result.ToString();
            }
        }


        // Window event handlers
        private void MainWindow_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if (isFullScreen)
            {
                e.Cancel = true;
            }
            else
            {
                DisposeResources();
                DisconnectFromArduino();
            }
        }

        private async void MainWindow_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.C && !isFullScreen)
            {
                await SwitchCamera();
            }
            else if (e.Key == Key.A && !isFullScreen)
            {
                ChangeArduinoConnectionState();
            }
            else if (e.Key == Key.U && !isFullScreen)
            {
                UpdateComPorts();
            }
        }

        // Methods for sound playback and background color change
        private async Task PlaySoundAndChangeBackground(SoundPlayer soundPlayer, System.Windows.Media.Brush color)
        {
            if (soundPlayer != null)
            {
                soundPlayer.Play();
            }
            if (color != null)
            {
                await Dispatcher.InvokeAsync(() =>
                {
                    Background = color;
                });
            }
        }

        // Methods for sound playback and background color change
        private void DisposeResources()
        {
            capture.Dispose();
            timer.Dispose();
            soundPlayerOk.Dispose();
            soundPlayerError.Dispose();
            UnhookWindowsHookEx(_hookID);
        }

        // Switch camera source
        private async Task SwitchCamera()
        {
            await PlaySoundAndChangeBackground(soundPlayerMaintenance, colorMaintenance);
            timer.Stop();

            capture.Dispose();

            await Task.Delay(1000);

            cameraIndex++;

            try
            {
                capture = new VideoCapture(cameraIndex);
                var frame = capture.QueryFrame();
                if (frame == null)
                {
                    throw new Exception("No frame");
                }
            }
            catch (Exception)
            {
                cameraIndex = 0;
                capture = new VideoCapture(cameraIndex);
            }

            timer.Start();
            await PlaySoundAndChangeBackground(null, colorNormal);
        }

        // Toggle full screen mode
        private async void ToggleFullScreen()
        {
            await PlaySoundAndChangeBackground(soundPlayerMaintenance, colorMaintenance);
            if (!isFullScreen)
            {
                _hookID = SetHook(_proc);
                this.Topmost = true;
                this.WindowState = WindowState.Normal;
                this.WindowStyle = WindowStyle.None;
                this.WindowState = WindowState.Maximized;
                this.ResizeMode = ResizeMode.NoResize;
                Overlay.Visibility = Visibility.Hidden;
                isFullScreen = true;
            }
            else
            {
                UnhookWindowsHookEx(_hookID);

                this.Topmost = false;
                this.WindowStyle = WindowStyle.SingleBorderWindow;
                this.WindowState = WindowState.Normal;
                this.ResizeMode = ResizeMode.CanResize;
                Overlay.Visibility = Visibility.Visible;
                isFullScreen = false;
            }
        }

        // Keyboard hook methods
        private static IntPtr SetHook(LowLevelKeyboardProc proc)
        {
            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
            }
        }

        private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN)
            {
                int vkCode = Marshal.ReadInt32(lParam);
                if (vkCode == (int)KeyInterop.VirtualKeyFromKey(Key.LWin) || vkCode == (int)KeyInterop.VirtualKeyFromKey(Key.RWin))
                {
                    return (IntPtr)1;
                }
            }
            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }

        private void ComboBox_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {

        }
    }
}