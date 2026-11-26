<?php

declare(strict_types=1);

namespace App\Core;

use RuntimeException;

class CodeMailer
{
    public static function send(string $email, string $code): void
    {
        $settings = require __DIR__ . '/../Config/mail.php';
        $username = $settings['username'];
        $password = $settings['password'];
        if ($password === '') {
            throw new RuntimeException('Mail credentials are missing');
        }
        $socket = stream_socket_client('ssl://smtp.gmail.com:465', $errno, $error, 10);
        if ($socket === false) {
            throw new RuntimeException('SMTP connection failed');
        }
        stream_set_timeout($socket, 10);
        try {
            self::expect($socket, 220);
            self::command($socket, 'EHLO localhost', 250);
            self::command($socket, 'AUTH LOGIN', 334);
            self::command($socket, base64_encode($username), 334);
            self::command($socket, base64_encode($password), 235);
            self::command($socket, "MAIL FROM:<$username>", 250);
            self::command($socket, "RCPT TO:<$email>", 250);
            self::command($socket, 'DATA', 354);
            $message = "From: Wax & Wire <$username>\r\n"
                . "To: <$email>\r\n"
                . "Subject: Wax & Wire login code\r\n"
                . "Date: " . gmdate('D, d M Y H:i:s O') . "\r\n"
                . "MIME-Version: 1.0\r\n"
                . "Content-Type: text/plain; charset=UTF-8\r\n"
                . "Content-Transfer-Encoding: base64\r\n\r\n"
                . chunk_split(base64_encode("Код входа в Wax & Wire: $code\nКод действует 10 минут."))
                . "\r\n.";
            self::command($socket, $message, 250);
            // The server has accepted delivery. Closing the connection ends the session.
        } finally {
            fclose($socket);
        }
    }

    private static function command($socket, string $command, int $expected): void
    {
        self::write($socket, $command . "\r\n");
        self::expect($socket, $expected);
    }

    private static function write($socket, string $data): void
    {
        while ($data !== '') {
            $written = fwrite($socket, $data);
            if ($written === false || $written === 0) {
                throw new RuntimeException('SMTP write failed');
            }
            $data = substr($data, $written);
        }
    }

    private static function expect($socket, int $expected): void
    {
        do {
            $line = fgets($socket, 4096);
            if ($line === false || !preg_match('/^\d{3}[ -]/', $line)) {
                $metadata = stream_get_meta_data($socket);
                if ($metadata['timed_out']) {
                    throw new RuntimeException('SMTP response timed out');
                }
                if ($line === false) {
                    throw new RuntimeException("SMTP connection closed before response $expected");
                }
                throw new RuntimeException("Invalid SMTP response, expected $expected");
            }
        } while ($line[3] === '-');
        if ((int) substr($line, 0, 3) !== $expected) {
            throw new RuntimeException("SMTP request rejected: expected $expected, received " . substr($line, 0, 3));
        }
    }
}
