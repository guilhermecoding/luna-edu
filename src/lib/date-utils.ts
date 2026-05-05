export function isValidDate(date: Date) {
    return !Number.isNaN(date.getTime());
}

export function calculateAge(birthDate: Date | string) {
    const date = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
        age--;
    }
    return age;
}
