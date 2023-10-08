using System;
using System.Windows;
using System.Drawing;
using System.Windows.Input;
using System.Drawing.Imaging;
using System.IO;
using System.Timers;
using System.Windows.Media.Imaging;
using ZXing;
using ZXing.Common;
using Emgu.CV;
using Emgu.CV.Structure;
using Emgu.CV.CvEnum;
using System.Media;
using System.Threading.Tasks;
using System.Windows.Media;
using System.Security.Cryptography;
using System.Text;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace schule_als_staat_qr_scanner
{
    public partial class MainWindow : Window
    {
        private readonly System.Windows.Media.Brush colorOk = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#113a1b");
        private readonly System.Windows.Media.Brush colorError = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#450c0f");
        private readonly System.Windows.Media.Brush colorMaintenance = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#5c4a00");
        private readonly System.Windows.Media.Brush colorNormal = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#303133");
        private const int cameraFps = 30;
        private VideoCapture capture;
        private readonly Timer timer = new Timer()
        {
            Interval = 1000 / cameraFps,
            Enabled = true
        };
        private readonly SoundPlayer soundPlayerOk = new SoundPlayer(Properties.Resources.sound_ok);
        private readonly SoundPlayer soundPlayerError = new SoundPlayer(Properties.Resources.sound_error);
        private DateTime lastScanTime = DateTime.MinValue;
        private string lastQrCode;
        private readonly string salt = Encoding.UTF8.GetString(Properties.Resources.salt);
        private bool isFullScreen = false;
        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        private static LowLevelKeyboardProc _proc = HookCallback;
        private static IntPtr _hookID = IntPtr.Zero;
        private int cameraIndex = 0;
        private readonly SoundPlayer soundPlayerMaintenance = new SoundPlayer(Properties.Resources.sound_maintenance);

        public MainWindow()
        {
            InitializeComponent();
            InitializeComponents();
            this.Closing += MainWindow_Closing;
            this.KeyDown += MainWindow_KeyDown;
        }

        private void InitializeComponents()
        {
            capture = new VideoCapture(cameraIndex);

            timer.Elapsed += Timer_Tick;
        }

        private async void Timer_Tick(object sender, ElapsedEventArgs e)
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
                                TextDataTime.Text = $"Scanned on {DateTime.Now.ToLongDateString()} at {DateTime.Now.ToLongTimeString()}";
                            }
                        }
                        else
                        {
                            if (qrcode.Contains("§esam öffne dich"))
                            {
                                ToggleFullScreen();
                            }
                            else
                            {
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
        }

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

            string expectedHash = GenerateMD5Hash($"{firstName}{salt}{surname}{salt}{className}");
            return expectedHash == hash;
        }

        private string GenerateMD5Hash(string input)
        {
            using (MD5 md5 = MD5.Create())
            {
                byte[] inputBytes = Encoding.ASCII.GetBytes(input);
                byte[] hashBytes = md5.ComputeHash(inputBytes);

                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < hashBytes.Length; i++)
                {
                    sb.Append(hashBytes[i].ToString("X2"));
                }
                return sb.ToString().ToLower();
            }
        }

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

        private void DisposeResources()
        {
            capture.Dispose();
            timer.Dispose();
            soundPlayerOk.Dispose();
            soundPlayerError.Dispose();
            UnhookWindowsHookEx(_hookID);
        }

        private static IntPtr SetHook(LowLevelKeyboardProc proc)
        {
            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
            }
        }

        private async void MainWindow_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.C && !isFullScreen)
            {
                await SwitchCamera();
            }
            if (e.Key == Key.F && !isFullScreen)
            {
                ToggleFullScreen();
            }
        }

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

        private async void ToggleFullScreen()
        {
            await PlaySoundAndChangeBackground(soundPlayerMaintenance, colorMaintenance);
            if (!isFullScreen)
            {
                _hookID = SetHook(_proc);
                this.WindowStyle = WindowStyle.None;
                this.WindowState = WindowState.Maximized;
                isFullScreen = true;
            }
            else
            {
                UnhookWindowsHookEx(_hookID);
                this.WindowStyle = WindowStyle.SingleBorderWindow;
                this.WindowState = WindowState.Normal;
                isFullScreen = false;
            }
        }

        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

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

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);
        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);
    }
}