using System;
using System.Windows;
using System.Drawing;
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

namespace schule_als_staat_qr_scanner
{
    public partial class MainWindow : Window
    {
        private readonly VideoCapture capture;
        private readonly Timer timer;
        private readonly SoundPlayer soundPlayerOk;
        private readonly SoundPlayer soundPlayerError;
        private readonly SoundPlayer soundPlayerClear;
        private DateTime lastScanTime = DateTime.MinValue;
        private string lastQrCode;
        private readonly string salt = Encoding.UTF8.GetString(Properties.Resources.salt);
        public MainWindow()
        {
            InitializeComponent();

            int cameraFps = 30;
            capture = new VideoCapture(0);
            timer = new Timer()
            {
                Interval = 1000 / cameraFps,
                Enabled = true
            };
            timer.Elapsed += Timer_Tick;

            soundPlayerOk = new SoundPlayer(Properties.Resources.sound_ok);
            soundPlayerError = new SoundPlayer(Properties.Resources.sound_error);
            soundPlayerClear = new SoundPlayer(Properties.Resources.sound_bing);

            salt = Encoding.UTF8.GetString(Properties.Resources.salt);
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
            });

            string qrcode = await Task.Run(() => FindQrCodeInImage(bitmap));
            if (!string.IsNullOrEmpty(qrcode))
            {
                if (qrcode != lastQrCode)
                {
                    lastQrCode = qrcode;
                    lastScanTime = DateTime.Now;

                    await Dispatcher.InvokeAsync(() =>
                    {
                        TextContent.Text = qrcode;
                        TextTime.Text = $"Scanned on {DateTime.Now.ToLongDateString()} at {DateTime.Now.ToLongTimeString()}";
                        if (IsCodeValid(qrcode))
                        {
                            this.Background = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#113a1b");
                            PlaySoundAsync(soundPlayerOk);
                        }
                        else
                        {
                            this.Background = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#450c0f");
                            PlaySoundAsync(soundPlayerError);
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
                        await Dispatcher.InvokeAsync(() =>
                        {
                            this.Background = (System.Windows.Media.Brush)new BrushConverter().ConvertFrom("#303133");
                        });
                        // await PlaySoundAsync(soundPlayerClear);
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

        private Task PlaySoundAsync(SoundPlayer soundPlayer)
        {
            return Task.Run(() =>
            {
                soundPlayer.PlaySync();
            });
        }
    }
}