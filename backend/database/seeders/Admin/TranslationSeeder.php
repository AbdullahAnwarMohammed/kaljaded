<?php

namespace Database\Seeders\Admin;

use Illuminate\Database\Seeder;
use App\Models\Translation;

class TranslationSeeder extends Seeder
{
    public function run()
    {
        $translations = [
            // موجودة مسبقاً
            [
                'group'  => 'sidebar',
                'key'    => 'general-setting',
                'locale' => 'en',
                'value'  => 'General Setting',
            ],
            [
                'group'  => 'sidebar',
                'key'    => 'general-setting',
                'locale' => 'ar',
                'value'  => 'الاعدادات العامة',
            ],
            [
                'group'  => 'sidebar',
                'key'    => 'translations',
                'locale' => 'en',
                'value'  => 'Translations',
            ],
            [
                'group'  => 'sidebar',
                'key'    => 'translations',
                'locale' => 'ar',
                'value'  => 'الترجمات',
            ],

            // جديدة: أعمدة الجدول
            [
                'group'  => 'table',
                'key'    => 'number',
                'locale' => 'en',
                'value'  => '#',
            ],
            [
                'group'  => 'table',
                'key'    => 'number',
                'locale' => 'ar',
                'value'  => 'الرقم',
            ],
            [
                'group'  => 'table',
                'key'    => 'group',
                'locale' => 'en',
                'value'  => 'Group',
            ],
            [
                'group'  => 'table',
                'key'    => 'group',
                'locale' => 'ar',
                'value'  => 'المجموعة',
            ],
            [
                'group'  => 'table',
                'key'    => 'key',
                'locale' => 'en',
                'value'  => 'Key',
            ],
            [
                'group'  => 'table',
                'key'    => 'key',
                'locale' => 'ar',
                'value'  => 'المفتاح',
            ],
            [
                'group'  => 'table',
                'key'    => 'locale',
                'locale' => 'en',
                'value'  => 'Locale',
            ],
            [
                'group'  => 'table',
                'key'    => 'locale',
                'locale' => 'ar',
                'value'  => 'اللغة',
            ],
            [
                'group'  => 'table',
                'key'    => 'value',
                'locale' => 'en',
                'value'  => 'Value',
            ],
            [
                'group'  => 'table',
                'key'    => 'value',
                'locale' => 'ar',
                'value'  => 'القيمة',
            ],
            [
                'group'  => 'table',
                'key'    => 'actions',
                'locale' => 'en',
                'value'  => 'Actions',
            ],
            [
                'group'  => 'table',
                'key'    => 'actions',
                'locale' => 'ar',
                'value'  => 'الإجراءات',
            ],

            // عناوين الصفحة
            [
                'group'  => 'page',
                'key'    => 'translation-list',
                'locale' => 'en',
                'value'  => 'Translation List',
            ],
            [
                'group'  => 'page',
                'key'    => 'translation-list',
                'locale' => 'ar',
                'value'  => 'قائمة الترجمات',
            ],
            [
                'group'  => 'page',
                'key'    => 'home',
                'locale' => 'en',
                'value'  => 'Home',
            ],
            [
                'group'  => 'page',
                'key'    => 'home',
                'locale' => 'ar',
                'value'  => 'الصفحة الرئيسية',
            ],


            // buttons
            [
                'group'  => 'buttons',
                'key'    => 'save',
                'locale' => 'en',
                'value'  => 'Save',
            ],
            [
                'group'  => 'buttons',
                'key'    => 'save',
                'locale' => 'ar',
                'value'  => 'حفظ',
            ],
            [
                'group'  => 'buttons',
                'key'    => 'cancel',
                'locale' => 'en',
                'value'  => 'Cancel',
            ],
            [
                'group'  => 'buttons',
                'key'    => 'cancel',
                'locale' => 'ar',
                'value'  => 'إلفاء',
            ],
        ];

        foreach ($translations as $t) {
            Translation::updateOrCreate(
                [
                    'group'  => $t['group'],
                    'key'    => $t['key'],
                    'locale' => $t['locale'],
                ],
                ['value' => $t['value']]
            );
        }
    }
}
