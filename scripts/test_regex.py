import re

def clean_hindi_option_text(hi_text):
    # Pattern: Match ( English text ) at the end or inside the text
    # e.g. "जर्मन सिल्वर (German Silver)" -> "जर्मन सिल्वर"
    # "कोयला (Coal)" -> "कोयला"
    # "अमेरिका (USA)" -> "अमेरिका"
    # "बैंगनी (Violet)" -> "बैंगनी"
    # "एम. जी. रानाडे (M. G. Ranade)" -> "एम. जी. रानाडे"
    # "ब्रह्म (Brahm / Brahman)" -> "ब्रह्म"
    # "लाल बलुआ पत्थर (Red sandstone)" -> "लाल बलुआ पत्थर"
    
    # We want to match parentheses that contain primarily English letters [A-Za-z]
    # pattern: \s*\([A-Za-z0-9\s/.,\'-]+\)
    
    cleaned = re.sub(r'\s*\([A-Za-z0-9\s/.,\'-]+\)', '', hi_text).strip()
    # If the entire option was in parentheses (e.g. "(A)"), don't make it empty
    if not cleaned:
        return hi_text
    return cleaned

# Test on various samples
samples = [
    "जर्मन सिल्वर (German Silver)",
    "कोयला (Coal)",
    "अमेरिका (USA)",
    "बैंगनी (Violet)",
    "एनेलिडा (Annelida)",
    "एम. जी. रानाडे (M. G. Ranade)",
    "ब्रह्म (Brahm / Brahman)",
    "लाल बलुआ पत्थर (Red sandstone)",
    "होतृ (Hotri)",
    "IFPRI (वेल्थुंगरहिल्फ़े और कंसर्न वर्ल्डवाइड)",
    "CnH2n-2",
    "DNA"
]

for s in samples:
    print(f"'{s}' -> '{clean_hindi_option_text(s)}'")
