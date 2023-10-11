using Emgu.CV;
using Emgu.CV.CvEnum;
using Emgu.CV.Structure;
using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Media;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using ZXing;
using ZXing.Common;

namespace schule_als_staat_qr_scanner
{
    public partial class MainWindow : Window
    {
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
        private readonly Timer timer = new Timer() { Interval = 1000 / cameraFps, Enabled = true };

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

        public MainWindow()
        {
            InitializeComponent();
            InitializeComponents();
            this.Closing += MainWindow_Closing;
            this.KeyDown += MainWindow_KeyDown;
        }

        // Initialize camera and timer
        private void InitializeComponents()
        {
            capture = new VideoCapture(cameraIndex);
            timer.Elapsed += Timer_Tick;
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
                                await PlaySoundAndChangeBackground(soundPlayerOk, colorOk);
                                string[] parts = qrcode.Split(',');
                                if (parts.Length >= 2)
                                {
                                    string name = parts[0] + " " + parts[1];
                                    TextData.Text = name;
                                    TextDataTime.Text = $"{DateTime.Now.ToShortDateString()} - {DateTime.Now.ToLongTimeString()}";
                                }
                            }
                            else
                            {
                                if (qrcode.Contains(" öffne dich"))
                                {
                                    ToggleFullScreen();
                                }
                                else
                                {
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
            }
        }

        private async void MainWindow_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.C && !isFullScreen)
            {
                await SwitchCamera();
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
    }
}