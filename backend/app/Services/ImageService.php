<?php

namespace App\Services;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageService
{
    /**
     * Upload an image and convert it to WebP format.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $path
     * @param int $quality
     * @return string
     */
    public function uploadAndConvertToWebP($file, $path = 'uploads', $quality = 80)
    {
        // Create new image manager instance with desired driver
        $manager = new ImageManager(new Driver());

        // Generate unique filename
        $filename = uniqid() . '.webp';
        
        // Ensure directory exists
        if (!file_exists(public_path($path))) {
            mkdir(public_path($path), 0777, true);
        }

        // Read image from file
        $image = $manager->read($file);

        // Resize image if needed (optional)
        // $image->scale(width: 800);

        // Encode image to WebP
        $encoded = $image->toWebp($quality);

        // Save image
        $encoded->save(public_path($path . '/' . $filename));

        return $path . '/' . $filename;
    }
}
