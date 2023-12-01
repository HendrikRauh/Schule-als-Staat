using System;
using System.IO;
using System.Windows;

namespace schule_als_staat_qr_scanner
{
    /// <summary>
    /// Interaktionslogik für "App.xaml"
    /// </summary>
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;
        }

        void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            var exception = e.ExceptionObject as Exception;
            var logFilePath = "error.log"; // Specify your log file path here
        
            // Write the exception details to the log file
            File.WriteAllText(logFilePath, exception.ToString());
        
            // Open the log file
            System.Diagnostics.Process.Start(logFilePath);
        }
    }
}