<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CloudController extends Controller
{
    public static function handleImageUpload(Request $request): ?string
    {
        $imageUrl = null;

        try {

            if ($request->hasFile('profile_picture')) {
                $file = $request->file('profile_picture');

                // Creamos un nombre de archivo único
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension = $file->getClientOriginalExtension();
                $filename = 'perfil_'.uniqid().'_'.Str::slug($originalName).'.'.$extension;

                // Subimos los archivos a cloudinary
                $uploadedFilePath = Storage::disk('cloudinary')->putFileAs(
                    'lobos_de_castronegro/perfiles',
                    $file,
                    $filename
                );

                $imageUrl = Storage::disk('cloudinary')->url($uploadedFilePath);
            }
        } catch (\Exception $e) {
            return null;
        }

        return $imageUrl;
    }
}
