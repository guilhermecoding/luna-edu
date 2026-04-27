import Image from "next/image";
import { cn } from "@/lib/utils";

// Avateres masculinos
import babyMale from "@/assets/images/avatars/male/01_baby_male_0_3.webp";
import kidsMale1 from "@/assets/images/avatars/male/02_kids_ male_4_8.webp";
import kidsMale2 from "@/assets/images/avatars/male/03_kids_male_9_12.webp";
import teenMale from "@/assets/images/avatars/male/04_teen_male_13_16.webp";
import youngMale from "@/assets/images/avatars/male/05_young_male_17_24.webp";
import adultMale from "@/assets/images/avatars/male/06_adult_male_25_60.webp";
import seniorMale from "@/assets/images/avatars/male/07_adult_male_61_pro.webp";

// Avateres femininos
import babyFemale from "@/assets/images/avatars/female/01_baby_female_0_3.webp";
import kidsFemale1 from "@/assets/images/avatars/female/02_kids_female_4_8.webp";
import kidsFemale2 from "@/assets/images/avatars/female/03_kids_female_9_12.webp";
import teenFemale from "@/assets/images/avatars/female/04_teen_female_13_16.webp";
import youngFemale from "@/assets/images/avatars/female/05_young_female_17_24.webp";
import adultFemale from "@/assets/images/avatars/female/06_adult_female_25_60.webp";
import seniorFemale from "@/assets/images/avatars/female/07_adult_female_61_pro.webp";

// Avatar padrão/Gibby
import gibby from "@/assets/images/avatars/default/avatar_gibby_mono.svg";
import { Genre } from "@/generated/prisma/enums";

type AvatarUsersProps = {
    age?: number;
    genre?: Genre
    className?: string;
    alt?: string;
};

export default function AvatarUsers({ age = 0, genre, className, alt = "Avatar do usuário" }: AvatarUsersProps) {
    let src = gibby;

    if (genre === "MALE") {
        if (age >= 0 && age <= 3) src = babyMale;
        else if (age >= 4 && age <= 8) src = kidsMale1;
        else if (age >= 9 && age <= 12) src = kidsMale2;
        else if (age >= 13 && age <= 16) src = teenMale;
        else if (age >= 17 && age <= 24) src = youngMale;
        else if (age >= 25 && age <= 60) src = adultMale;
        else if (age >= 61) src = seniorMale;
    } else if (genre === "FEMALE") {
        if (age >= 0 && age <= 3) src = babyFemale;
        else if (age >= 4 && age <= 8) src = kidsFemale1;
        else if (age >= 9 && age <= 12) src = kidsFemale2;
        else if (age >= 13 && age <= 16) src = teenFemale;
        else if (age >= 17 && age <= 24) src = youngFemale;
        else if (age >= 25 && age <= 60) src = adultFemale;
        else if (age >= 61) src = seniorFemale;
    }

    return (
        <div className={cn("relative pointer-events-none overflow-hidden border border-surface-border shrink-0 rounded-full", className)}>
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
    );
}
