import re

def clean_hindi_text(text):
    original = text.strip()
    
    # Specific fixes
    if "बे Benito मुसोलिनी" in text:
        return "बेनितो मुसोलिनी"
    if "पुथारी (Puthari / हुत्तारी)" in text:
        return "पुथारी (हुत्तारी)"
    if "आईबेक्स (जंगली पहाड़ी बकरी / Ibex)" in text:
        return "आईबेक्स (जंगली पहाड़ी बकरी)"
    if "फल चमगादड़ (Fruit Bats / फ्लाइंग फॉक्स)" in text:
        return "फल चमगादड़ (फ्लाइंग फॉक्स)"
    if "माटे (Mate - रुको)" in text:
        return "माटे (रुको)"
    if "हाजिमे (Hajime - शुरू करो)" in text:
        return "हाजिमे (शुरू करो)"
    if "3 जनवरी (उपसौर / Perihelion)" in text:
        return "3 जनवरी (उपसौर)"
    if "4 जुलाई (अपसौर / Aphelion)" in text:
        return "4 जुलाई (अपसौर)"
    if "तार सप्तक (ऊंचा सुर / Taar Saptak)" in text:
        return "तार सप्तक"
    if "बॉयल का नियम (Boyle's Law - P ∝ 1/V)" in text:
        return "बॉयल का नियम"
    if "हिमोढ़ (Moraines - असंगठित मलबा)" in text:
        return "हिमोढ़ (असंगठित मलबा)"
    if "भ्रूण / गर्भस्थ शिशु (Foetus / गर्भ)" in text:
        return "भ्रूण (गर्भस्थ शिशु)"
    if "सीमांत (Marginal - जैसे मटर)" in text:
        return "सीमांत (जैसे मटर)"
    if "अक्षीय (Axile - जैसे नींबू, टमाटर)" in text:
        return "अक्षीय (जैसे नींबू, टमाटर)"
    if "आधारीय (Basal - जैसे सूरजमुखी)" in text:
        return "आधारीय (जैसे सूरजमुखी)"
    if "शुक्र (Venus - 243 दिन)" in text:
        return "शुक्र (243 दिन)"
    if "2.00 × 10⁸ मीटर/सेकंड (कांच में / 2.0 × 10⁸ m/s)" in text:
        return "2.00 × 10⁸ मीटर/सेकंड (कांच में)"
    if "3 N (3 न्यूटन)" in text:
        return "3 न्यूटन"
    if "1 N" in text:
        return "1 न्यूटन"
    if "6 N" in text:
        return "6 न्यूटन"
    if "18 N" in text:
        return "18 न्यूटन"
    if "IFPRI (वेल्थुंगरहिल्फ़े और कंसर्न वर्ल्डवाइड)" in text:
        return "IFPRI (वेल्थुंगरहिल्फ़े और कंसर्न वर्ल्डवाइड)"
    if "खाद्य एवं कृषि संगठन (FAO)" in text:
        return "खाद्य एवं कृषि संगठन (FAO)"
    if "संयुक्त राष्ट्र विकास कार्यक्रम (UNDP)" in text:
        return "संयुक्त राष्ट्र विकास कार्यक्रम (UNDP)"
    if "विश्व स्वास्थ्य संगठन (WHO)" in text:
        return "विश्व स्वास्थ्य संगठन (WHO)"

    # Don't strip if text is purely formula or abbreviation like CₙH₂ₙ or DNA or kg·m/s or He²⁺ or O₂
    if original in ["CₙH₂ₙ₊₂", "CₙH₂ₙ", "CₙH₂ₙ₋₂", "CₙH₂ₙ₋₄", "CₙH₂ₙO", "CₙH₂ₙ₊₂O", "CₙH₂ₙO₂", "CₙH₂ₙ₋₂O₂", "DNA", "RNA", "ATP"]:
        return original
    if re.match(r'^[A-Za-z0-9\s·\-_/⁺⁻²³⁴¹₂₃₄∝><=]+$', original):
        return original

    # Match and remove English in parentheses: e.g. (German Silver), (Coal), (USA), (Violet), (M. G. Ranade), (Brain & Meninges)
    cleaned = re.sub(r'\s*\([A-Za-z0-9\s/.,\'&—–-]+\)', '', original).strip()

    if cleaned and len(cleaned) > 0:
        return cleaned

    return original
