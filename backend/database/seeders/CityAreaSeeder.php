<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CityAreaSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks to allow truncation
        Schema::disableForeignKeyConstraints();
        DB::table('areas')->truncate();
        DB::table('cities')->truncate();
        Schema::enableForeignKeyConstraints();

        // ================== Cities (Governorates) ==================
        $cities = [
            ['id' => 1, 'name_ar' => 'العاصمة', 'name_en' => 'Capital', 'is_active' => true],
            ['id' => 2, 'name_ar' => 'الأحمدي', 'name_en' => 'Ahmadi', 'is_active' => true],
            ['id' => 3, 'name_ar' => 'الفروانية', 'name_en' => 'Farwaniya', 'is_active' => true],
            ['id' => 4, 'name_ar' => 'الجهراء', 'name_en' => 'Jahra', 'is_active' => true],
            ['id' => 5, 'name_ar' => 'حولي', 'name_en' => 'Hawalli', 'is_active' => true],
            ['id' => 6, 'name_ar' => 'مبارك الكبير', 'name_en' => 'Mubarak Al-Kabeer', 'is_active' => true],
        ];

        DB::table('cities')->insert($cities);

        // ================== Areas ==================
        $areas = [
            // Capital (id: 1)
            ['city_id' => 1, 'name_ar' => 'مدينة الكويت', 'name_en' => 'Kuwait City', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'الدسمة', 'name_en' => 'Dasma', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'الشامية', 'name_en' => 'Shamiya', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'المرقاب', 'name_en' => 'Mirqab', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'جبلة', 'name_en' => 'Jibla', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'شرق', 'name_en' => 'Sharq', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'بنيد القار', 'name_en' => 'Bneid Al-Gar', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'الدعية', 'name_en' => 'Daiya', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'المنصورية', 'name_en' => 'Mansouriya', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'النزهة', 'name_en' => 'Nuzha', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'الفيحاء', 'name_en' => 'Faiha', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'القادسية', 'name_en' => 'Qadisiya', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'الروضة', 'name_en' => 'Rawda', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'العديلية', 'name_en' => 'Adiliya', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'الخالدية', 'name_en' => 'Khaldiya', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'كيفان', 'name_en' => 'Kaifan', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'قرطبة', 'name_en' => 'Qurtuba', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'السرة', 'name_en' => 'Surra', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'اليرموك', 'name_en' => 'Yarmouk', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'الشويخ', 'name_en' => 'Shuwaikh', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'الري', 'name_en' => 'Al-Rai', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'غرناطة', 'name_en' => 'Granada', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'الصليبيخات', 'name_en' => 'Sulaibikhat', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'الدوحة', 'name_en' => 'Doha', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'النهضة', 'name_en' => 'Al-Nahda', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'مدينة جابر الأحمد', 'name_en' => 'Jaber Al-Ahmad City', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'القيروان', 'name_en' => 'Qairawan', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'شمال غرب الصليبيخات', 'name_en' => 'Northwest Sulaibikhat', 'is_active' => true],
            ['city_id' => 1, 'name_ar' => 'عبدالله السالم', 'name_en' => 'Abdullah Al-Salem', 'is_active' => true],

            // Ahmadi (id: 2)
            ['city_id' => 2, 'name_ar' => 'مدينة الأحمدي', 'name_en' => 'Ahmadi City', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'الفحيحيل', 'name_en' => 'Fahaheel', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'أبو حليفة', 'name_en' => 'Abu Halifa', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'المنقف', 'name_en' => 'Mangaf', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'المهبولة', 'name_en' => 'Mahboula', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'الرقة', 'name_en' => 'Riqqa', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'هدية', 'name_en' => 'Hadiya', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'الظهر', 'name_en' => 'Dhaher', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'صباح الأحمد', 'name_en' => 'Sabah Al-Ahmad City', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'علي صباح السالم', 'name_en' => 'Ali Sabah Al Salem (Umm Al Hayman)', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'ميناء عبدالله', 'name_en' => 'Mina Abdullah', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'الشعيبة', 'name_en' => 'Shuaiba', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'الوفرة', 'name_en' => 'Wafra', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'الزور', 'name_en' => 'Al-Zour', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'الخيران', 'name_en' => 'Khiran', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'الفنطاس', 'name_en' => 'Fintas', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'جابر العلي', 'name_en' => 'Jaber Al-Ali', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'ضاحية فهد الأحمد', 'name_en' => 'Fahad Al-Ahmad Suburb', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'صباح الأحمد البحرية', 'name_en' => 'Sabah Al-Ahmad Sea City', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'جليعة', 'name_en' => 'Julaia\'a', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'بنيدر', 'name_en' => 'Bnaider', 'is_active' => true],
            ['city_id' => 2, 'name_ar' => 'الجليعة', 'name_en' => 'Al-Julaia', 'is_active' => true],

            // Farwaniya (id: 3)
            ['city_id' => 3, 'name_ar' => 'الفروانية', 'name_en' => 'Farwaniya', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'خيطان', 'name_en' => 'Khaitan', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'جليب الشيوخ', 'name_en' => 'Jleeb Al-Shuyoukh', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'العارضية', 'name_en' => 'Ardiya', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'الفردوس', 'name_en' => 'Firdous', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'صباح الناصر', 'name_en' => 'Sabah Al-Nasser', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'الرابية', 'name_en' => 'Rabya', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'الرحاب', 'name_en' => 'Rehab', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'الرقعي', 'name_en' => 'Riggae', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'الأندلس', 'name_en' => 'Andalus', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'اشبيلية', 'name_en' => 'Ishbiliya', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'الضجيج', 'name_en' => 'Dhajeej', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'عبدالله المبارك (غرب الجليب)', 'name_en' => 'Abdullah Al-Mubarak (West Jleeb)', 'is_active' => true],
            ['city_id' => 3, 'name_ar' => 'الشدادية', 'name_en' => 'Shaddadiya', 'is_active' => true],

            // Jahra (id: 4)
            ['city_id' => 4, 'name_ar' => 'مدينة الجهراء', 'name_en' => 'Jahra City', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'الصليبية', 'name_en' => 'Sulaibiya', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'تيماء', 'name_en' => 'Taima', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'النعيم', 'name_en' => 'Naeem', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'الواحة', 'name_en' => 'Waha', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'القيصرية', 'name_en' => 'Qaisariya', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'العيون', 'name_en' => 'Ouyoun', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'القصر', 'name_en' => 'Qasr', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'أمغرة', 'name_en' => 'Amghara', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'كبد', 'name_en' => 'Kabed', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'العبدلي', 'name_en' => 'Abdali', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'الروضتين', 'name_en' => 'Rawdatain', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'الصبية', 'name_en' => 'Subiya', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'سعد العبدالله', 'name_en' => 'Saad Al-Abdullah', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'المطلاع', 'name_en' => 'Mutla\'a', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'كاظمة', 'name_en' => 'Kazma', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'السالمي', 'name_en' => 'Salmi', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'النسيم', 'name_en' => 'Al-Naseem', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'جزيرة بوبيان', 'name_en' => 'Bubiyan Island', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'جزيرة وربة', 'name_en' => 'Warbah Island', 'is_active' => true],
            ['city_id' => 4, 'name_ar' => 'أم العيش', 'name_en' => 'Umm Al Aish', 'is_active' => true],

            // Hawalli (id: 5)
            ['city_id' => 5, 'name_ar' => 'حولي', 'name_en' => 'Hawalli', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'السالمية', 'name_en' => 'Salmiya', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'الرميثية', 'name_en' => 'Rumaitiya', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'الجابرية', 'name_en' => 'Jabriya', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'مشرف', 'name_en' => 'Mishref', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'بيان', 'name_en' => 'Bayan', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'سلوى', 'name_en' => 'Salwa', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'الشهداء', 'name_en' => 'Shuhada', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'حطين', 'name_en' => 'Hitteen', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'الزهراء', 'name_en' => 'Zahra', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'الصديق', 'name_en' => 'Siddiq', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'السلام', 'name_en' => 'Salam', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'البدع', 'name_en' => 'Al-Bida', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'النقرة', 'name_en' => 'Al-Naqra', 'is_active' => true],
            ['city_id' => 5, 'name_ar' => 'الشعب', 'name_en' => 'Al-Shaab', 'is_active' => true],

            // Mubarak Al-Kabeer (id: 6)
            ['city_id' => 6, 'name_ar' => 'مبارك الكبير', 'name_en' => 'Mubarak Al-Kabeer', 'is_active' => true],
            ['city_id' => 6, 'name_ar' => 'القرين', 'name_en' => 'Qurain', 'is_active' => true],
            ['city_id' => 6, 'name_ar' => 'العدان', 'name_en' => 'Adan', 'is_active' => true],
            ['city_id' => 6, 'name_ar' => 'القصور', 'name_en' => 'Qusour', 'is_active' => true],
            ['city_id' => 6, 'name_ar' => 'ضاحية صباح السالم', 'name_en' => 'Sabah Al-Salem Suburb', 'is_active' => true],
            ['city_id' => 6, 'name_ar' => 'المسيلة', 'name_en' => 'Maseelah', 'is_active' => true],
            ['city_id' => 6, 'name_ar' => 'أبو فطيرة', 'name_en' => 'Abu Futeira', 'is_active' => true],
            ['city_id' => 6, 'name_ar' => 'الفنيطيس', 'name_en' => 'Funaitees', 'is_active' => true],
            ['city_id' => 6, 'name_ar' => 'صبحان', 'name_en' => 'Subhan', 'is_active' => true],
            ['city_id' => 6, 'name_ar' => 'مسايل', 'name_en' => 'Masayel', 'is_active' => true],
        ];

        DB::table('areas')->insert($areas);
    }
}
