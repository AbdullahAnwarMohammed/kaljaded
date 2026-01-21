<?php

use App\Models\Translation;

if (! function_exists('loadTranslations')) {
    function loadTranslations($locale = null)
    {
        $locale = $locale ?? app()->getLocale();

        return Translation::where('locale', $locale)
            ->get()
            ->groupBy('group')
            ->map(function ($items) {
                return $items->pluck('value', 'key');
            })
            ->toArray();
    }
}
if (! function_exists('t')) {
    function t($key, $replace = [], $locale = null)
    {
        $locale = $locale ?? app()->getLocale();
        $translations = loadTranslations($locale);
        if (str_contains($key, '.')) {
            [$group, $item] = explode('.', $key, 2);
            $translation = $translations[$group][$item]
                ?? loadTranslations('en')[$group][$item]
                ?? $key;
        } else {
            $translation = $translations['*'][$key]
                ?? loadTranslations('en')['*'][$key]
                ?? $key;
        }

        foreach ($replace as $search => $value) {
            $translation = str_replace(':' . $search, $value, $translation);
        }

        return $translation;
    }
}
