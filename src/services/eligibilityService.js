// src/services/eligibilityService.js

function getAgeCategory(birth_date) {
    const birthDate = new Date(birth_date);

    // Age is calculated as of December 31 of the current season, not today's actual date.
    const today = new Date();
    const seasonEnd = new Date(today.getFullYear(), 11, 31); // month 11 = December (0-indexed)

    let age = seasonEnd.getFullYear() - birthDate.getFullYear();

    // Adjust if the birthday hasn't happened yet by Dec 31 (it always has, since
    // Dec 31 is the last day of the year — but this guards against same-year edge cases).
    const hasHadBirthdayBySeasonEnd =
        seasonEnd.getMonth() > birthDate.getMonth() ||
        (seasonEnd.getMonth() === birthDate.getMonth() && seasonEnd.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayBySeasonEnd) {
        age -= 1;
    }

    if (age < 6) return 'eveil';
    if (age <= 8) return 'poussin';
    if (age <= 10) return 'benjamin';
    if (age <= 12) return 'minime';
    if (age <= 14) return 'cadet';
    if (age <= 17) return 'junior';
    if (age <= 39) return 'senior';
    return 'veteran';
}

function isMedicalCertificateValid(medical_certificate_date, is_high_risk) {
    if (!medical_certificate_date) {
        return false; // no certificate on file at all — not valid
    }

    const certDate = new Date(medical_certificate_date);
    const validityYears = is_high_risk ? 1 : 3;

    const expirationDate = new Date(certDate);
    expirationDate.setFullYear(certDate.getFullYear() + validityYears);

    const today = new Date();
    return today < expirationDate;
}

module.exports = { getAgeCategory, isMedicalCertificateValid };