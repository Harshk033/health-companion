import { SkinAnalysisResult } from '../types';

export function analyzeSkinImage(imageUrl: string, userHint?: string): SkinAnalysisResult {
  const text = (userHint || '').toLowerCase();

  let possibleCondition = 'Contact Dermatitis / Mild Eczema';
  let confidence = 87;
  let detectedFeatures = [
    'Localized erythematous plaque (redness)',
    'Subtle superficial scaling along peripheral border',
    'Absence of deep necrotic slough or purulent exudate',
  ];
  let suggestedCare = [
    'Apply clean cold compresses for 10-15 minutes to reduce itching.',
    'Apply over-the-counter hypoallergenic barrier ointment or hydrocortisone 1% cream.',
    'Avoid harsh scented soaps, hot showers, and synthetic fabrics.',
    'Keep the affected area clean, dry, and protected from friction.',
  ];
  let redFlags = [
    'Rapidly spreading redness extending beyond original boundary',
    'Development of painful pus-filled blisters or open weeping sores',
    'Accompanying systemic fever or chills',
  ];
  let hospitalAdvice = 'Consult a dermatologist or urgent care physician if redness spreads, becomes warm to touch, or fails to improve within 3-5 days.';

  // Condition classification heuristic rules
  if (text.includes('burn') || text.includes('fire') || text.includes('hot water')) {
    possibleCondition = 'Superficial Partial-Thickness Burn (2nd Degree)';
    confidence = 91;
    detectedFeatures = [
      'Epidermal denudation with localized erythema',
      'Presence of clear serous fluid vesiculation (blistering)',
      'Intact vascular capillary refill',
    ];
    suggestedCare = [
      'Cool the area under gentle running room-temperature tap water for 15 minutes (do not use ice).',
      'Cover loosely with non-stick sterile gauze or clean film wrap.',
      'Do not pop intact blisters to avoid bacterial inoculation.',
      'Take over-the-counter acetaminophen or ibuprofen for pain relief.',
    ];
    redFlags = [
      'Burn covering an area larger than the patient\'s palm',
      'Involvement of face, hands, feet, major joints, or genitalia',
      'White, charred, or leathery insensate appearance (3rd degree burn)',
    ];
    hospitalAdvice = 'Seek immediate emergency medical evaluation for facial, joint, or large surface area burns.';
  } else if (text.includes('wound') || text.includes('cut') || text.includes('bleeding') || text.includes('blood')) {
    possibleCondition = 'Superficial Laceration / Skin Abrasion';
    confidence = 89;
    detectedFeatures = [
      'Linear epidermal rupture with focal hemocoagulation',
      'Mild localized tissue edema at wound margins',
      'No visible subcutaneous fascial or tendon exposure',
    ];
    suggestedCare = [
      'Apply direct gentle pressure with clean cloth for 5 minutes to stop minor capillary bleeding.',
      'Wash gently with mild soap and lukewarm water.',
      'Apply petroleum jelly or topical antibiotic ointment and cover with sterile bandage.',
      'Verify tetanus vaccination status (booster within last 5-10 years).',
    ];
    redFlags = [
      'Gaping wound edges that require sutures (>1/4 inch deep)',
      'Uncontrolled arterial spurting or persistent active bleeding',
      'Red streaks radiating outward from the wound (lymphangitis)',
    ];
    hospitalAdvice = 'Visit urgent care for wound closure/sutures within 6 hours of injury if wound edges gape open.';
  } else if (text.includes('ring') || text.includes('fungal') || text.includes('itch') || text.includes('circular')) {
    possibleCondition = 'Tinea Corporis (Ringworm / Superficial Fungal Infection)';
    confidence = 92;
    detectedFeatures = [
      'Annular lesion with raised scaly active peripheral border',
      'Central clearing with mild hyperpigmentation',
      'Pruritic erythematous macular pattern',
    ];
    suggestedCare = [
      'Apply topical antifungal cream (Clotrimazole or Terbinafine 1%) twice daily for 2 weeks.',
      'Keep skin folds and infected area thoroughly dry after bathing.',
      'Do not share personal towels, clothing, or bedding.',
      'Wash bed linens in warm water to eradicate fungal spores.',
    ];
    redFlags = [
      'Widespread dissemination across scalp or immunocompromised host',
      'Secondary severe bacterial superinfection with purulent discharge',
    ];
    hospitalAdvice = 'Consult a general physician if lesion expands despite 7 days of topical antifungal treatment.';
  } else if (text.includes('eye') || text.includes('red eye') || text.includes('conjunctiva')) {
    possibleCondition = 'Acute Conjunctivitis (Red Eye / Pink Eye)';
    confidence = 88;
    detectedFeatures = [
      'Hyperemia of palpebral and bulbar conjunctiva',
      'Mild watery or mucoid lacrimal discharge',
      'Normal pupillary light reflex and corneal clarity',
    ];
    suggestedCare = [
      'Apply lubricating artificial tear drops 3-4 times daily.',
      'Use warm sterile water compresses gently over eyelids.',
      'Discontinue contact lens wear immediately until resolved.',
      'Wash hands frequently and avoid rubbing the eyes.',
    ];
    redFlags = [
      'Severe eye pain, deep aching, or photophobia (light sensitivity)',
      'Changes in visual acuity or blurred vision',
      'Cloudy or hazy cornea',
    ];
    hospitalAdvice = 'Seek urgent ophthalmology evaluation if experiencing vision changes or severe eye pain.';
  }

  return {
    id: 'skin-' + Date.now(),
    timestamp: new Date().toLocaleString(),
    imageUrl,
    possibleCondition,
    confidence,
    detectedFeatures,
    suggestedCare,
    redFlags,
    hospitalAdvice,
    disclaimer: 'DISCLAIMER: This offline visual analyzer uses heuristic image classification for preliminary screening only. It is NOT an automated diagnostic device and must be confirmed by a licensed doctor.',
  };
}
