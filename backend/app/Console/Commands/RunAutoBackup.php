<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;


class RunAutoBackup extends Command
{

    protected $signature = 'backup:run';


    protected $description = 'Export MySQL database backup into storage/app';


    public function handle()
    {
        $filename = 'backup_' . date('Y_m_d_His') . '.sql';
        $rawPath = storage_path("app/backups/$filename");

        $backupDir = storage_path('app/backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $path = '"' . str_replace('/', DIRECTORY_SEPARATOR, $rawPath) . '"';
        $dbHost = env('DB_HOST', '127.0.0.1');
        $dbUser = env('DB_USERNAME');
        $dbPass = env('DB_PASSWORD');
        $dbName = env('DB_DATABASE');

        $mysqldump = env('MYSQLDUMP_PATH', 'mysqldump');
        $mysqldump = '"' . str_replace('/', DIRECTORY_SEPARATOR, $mysqldump) . '"';

        $command = "$mysqldump --user=$dbUser "
            . (!empty($dbPass) ? "--password=\"$dbPass\"" : "")
            . " --host=$dbHost --skip-lock-tables $dbName > $path";

        exec($command, $output, $result);

        if ($result === 0 && file_exists($rawPath)) {
            $this->info("✅ Backup completed: $rawPath");
        } else {
            $this->error("❌ فشل تصدير قاعدة البيانات");
            $this->line("Command: $command");
            if (!empty($output)) {
                $this->line("Error Output:");
                $this->line(implode("\n", $output));
            }
        }
    }
}
