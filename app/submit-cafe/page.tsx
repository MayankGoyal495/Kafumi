'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Upload,
  Loader2,
  Edit2,
  Save,
  ChevronDown,
  ChevronUp,
  Check,
  Coffee,
  MapPin,
  Clock,
  Utensils,
  Image as ImageIcon,
  Wifi,
  Music,
  Users,
  Heart,
  Calendar,
  PawPrint,
  Cigarette,
  Gamepad2,
  Car,
  Zap,
  TreePine,
  Building,
  Volume2,
  CloudSun,
  Camera
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MenuItem {
  name: string;
  type: 'Veg' | 'Non-Veg' | 'Egg';
  price: string;
  description: string;
  recommended: boolean;
}

interface MenuSection {
  sectionName: string;
  items: MenuItem[];
}

interface FormData {
  cafeName: string;
  contactNumberKafumi: string;
  contactNumberUsers: string;
  city: string;
  address: string;
  googleMapsLink: string;
  email: string;
  instagram: string;
  facebook: string;
  website: string;
  openingHours: string;
  closingHours: string;
  openingDays: string;
  avgPricePerPerson: string;
  pureVeg: string;
  shortDescription: string;
  purpose: string[];
  ambienceType: string[];
  amenities: string[];
  foodDrinkTypes: string[];
  menuSections: MenuSection[];
  bestDish1: string;
  bestDish2: string;
  bestDish3: string;
}

export default function SubmitCafePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [currentSection, setCurrentSection] = useState<MenuSection>({
    sectionName: '',
    items: [],
  });
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [purpose, setPurpose] = useState<string[]>([]);
  const [ambienceType, setAmbienceType] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [foodDrinkTypes, setFoodDrinkTypes] = useState<string[]>([]);
  const [avgPrice, setAvgPrice] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [bestDish1, setBestDish1] = useState('');
  const [bestDish2, setBestDish2] = useState('');
  const [bestDish3, setBestDish3] = useState('');

  // Section 5 State
  const [hasCoverImage, setHasCoverImage] = useState(false);
  const [hasPhotos, setHasPhotos] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);

  const [showDraftNotice, setShowDraftNotice] = useState(false);
  const [draftTime, setDraftTime] = useState('');

  // Form State for text fields
  const [formState, setFormState] = useState({
    cafeName: '',
    contactNumberKafumi: '',
    contactNumberUsers: '',
    city: '',
    address: '',
    googleMapsLink: '',
    email: '',
    instagram: '',
    facebook: '',
    website: '',
    openingHours: '',
    closingHours: '',
    openingDays: '',
    pureVeg: '',
    shortDescription: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, fieldName?: string) => {
    if (typeof e === 'string' && fieldName) {
      // For custom inputs like RadioGroup that pass value directly
      setFormState(prev => ({ ...prev, [fieldName]: e }));
    } else if (typeof e === 'object' && 'target' in e) {
      // For standard inputs
      const { name, value } = e.target;
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  // Section collapse states
  const [expandedSections, setExpandedSections] = useState({
    section1: true,
    section2: false,
    section3: false,
    section4: false,
    section5: false,
  });

  // Section completion tracking
  const [sectionCompletion, setSectionCompletion] = useState({
    section1: false,
    section2: false,
    section3: false,
    section4: false,
    section5: false,
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('kafumi-cafe-draft');
    if (savedDraft) {
      try {
        const draft: FormData = JSON.parse(savedDraft);
        const savedTime = localStorage.getItem('kafumi-cafe-draft-time');

        // Restore form data
        setPurpose(draft.purpose || []);
        setAmbienceType(draft.ambienceType || []);
        setAmenities(draft.amenities || []);
        setFoodDrinkTypes(draft.foodDrinkTypes || []);
        setMenuSections(draft.menuSections || []);
        const loadedAvgPrice = draft.avgPricePerPerson || '';
        setAvgPrice(loadedAvgPrice);
        setPriceRange(calculatePriceRange(loadedAvgPrice));
        setBestDish1(draft.bestDish1 || '');
        setBestDish2(draft.bestDish2 || '');
        setBestDish3(draft.bestDish3 || '');

        setFormState({
          cafeName: draft.cafeName || '',
          contactNumberKafumi: draft.contactNumberKafumi || '',
          contactNumberUsers: draft.contactNumberUsers || '',
          city: draft.city || '',
          address: draft.address || '',
          googleMapsLink: draft.googleMapsLink || '',
          email: draft.email || '',
          instagram: draft.instagram || '',
          facebook: draft.facebook || '',
          website: draft.website || '',
          openingHours: draft.openingHours || '',
          closingHours: draft.closingHours || '',
          openingDays: draft.openingDays || '',
          pureVeg: draft.pureVeg || '',
          shortDescription: draft.shortDescription || '',
        });

        if (savedTime) {
          const minutes = Math.floor((Date.now() - parseInt(savedTime)) / 60000);
          setDraftTime(minutes < 1 ? 'just now' : `${minutes} minute${minutes > 1 ? 's' : ''} ago`);
          setShowDraftNotice(true);
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);



  // Auto-save on blur and section changes
  useEffect(() => {
    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [purpose, ambienceType, amenities, foodDrinkTypes, menuSections, avgPrice, bestDish1, bestDish2, bestDish3, formState]);

  // Check section completion
  useEffect(() => {
    checkSectionCompletion();
  }, [purpose, ambienceType, amenities, foodDrinkTypes, menuSections, avgPrice, formState, hasCoverImage, hasPhotos, hasConsent]);

  const checkSectionCompletion = () => {
    setSectionCompletion({
      section1: !!(
        formState.cafeName &&
        formState.contactNumberKafumi &&
        formState.city &&
        formState.address &&
        formState.googleMapsLink
      ),
      section2: !!(
        formState.openingHours &&
        formState.closingHours &&
        avgPrice &&
        formState.pureVeg
      ),
      section3: purpose.length > 0 && ambienceType.length > 0 && amenities.length > 0,
      section4: foodDrinkTypes.length > 0 || menuSections.length > 0,
      section5: hasCoverImage && hasConsent,
    });
  };

  // Auto-save to localStorage
  const saveDraft = () => {
    try {
      const draft: Partial<FormData> = {
        ...formState,
        avgPricePerPerson: avgPrice,
        purpose,
        ambienceType,
        amenities,
        foodDrinkTypes,
        menuSections,
        bestDish1,
        bestDish2,
        bestDish3,
      };

      localStorage.setItem('kafumi-cafe-draft', JSON.stringify(draft));
      localStorage.setItem('kafumi-cafe-draft-time', Date.now().toString());
    } catch (e) {
      console.error('Failed to save draft:', e);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const expandNextSection = (currentSection: keyof typeof expandedSections) => {
    const sections: (keyof typeof expandedSections)[] = ['section1', 'section2', 'section3', 'section4', 'section5'];
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setExpandedSections(prev => ({
        ...prev,
        [currentSection]: false,
        [nextSection]: true
      }));

      // Smooth scroll to next section
      setTimeout(() => {
        const element = document.getElementById(nextSection);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Get all dish names from menu sections for the dropdown
  const getAllDishNames = () => {
    const dishes: string[] = [];
    menuSections.forEach(section => {
      section.items.forEach(item => {
        if (item.name.trim()) {
          dishes.push(item.name);
        }
      });
    });
    return dishes;
  };

  // Calculate price range based on average price
  const calculatePriceRange = (price: string) => {
    const numPrice = parseInt(price);
    if (isNaN(numPrice)) return '';

    if (numPrice < 300) return 'Budget Friendly – under ₹300';
    if (numPrice <= 600) return 'Moderate – ₹300–₹600';
    if (numPrice <= 900) return 'Mid-Range – ₹600–₹900';
    return 'Premium – ₹900+';
  };

  const handleAvgPriceChange = (value: string) => {
    setAvgPrice(value);
    setPriceRange(calculatePriceRange(value));
  };

  const addMenuItem = () => {
    setCurrentSection({
      ...currentSection,
      items: [
        ...currentSection.items,
        { name: '', type: 'Veg', price: '', description: '', recommended: false },
      ],
    });
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: any) => {
    const newItems = [...currentSection.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Check if more than 5 recommended
    const recommendedCount = newItems.filter(item => item.recommended).length;
    if (field === 'recommended' && value && recommendedCount > 5) {
      toast.error('Maximum 5 dishes can be recommended');
      return;
    }

    setCurrentSection({ ...currentSection, items: newItems });
  };

  const removeMenuItem = (index: number) => {
    const newItems = currentSection.items.filter((_, i) => i !== index);
    setCurrentSection({ ...currentSection, items: newItems });
  };

  const addOrUpdateSection = () => {
    if (!currentSection.sectionName || currentSection.items.length === 0) {
      toast.error('Please add section name and at least one dish');
      return;
    }

    // Validate that all items have name and price
    const invalidItems = currentSection.items.filter(item => !item.name || !item.price);
    if (invalidItems.length > 0) {
      toast.error('All dishes must have a name and price');
      return;
    }

    if (editingSectionIndex !== null) {
      // Update existing section
      const newSections = [...menuSections];
      newSections[editingSectionIndex] = currentSection;
      setMenuSections(newSections);
      setEditingSectionIndex(null);
      toast.success('Section updated!');
    } else {
      // Add new section
      setMenuSections([...menuSections, currentSection]);
      toast.success('Section added!');
    }

    setCurrentSection({ sectionName: '', items: [] });
  };

  const editSection = (index: number) => {
    setCurrentSection(menuSections[index]);
    setEditingSectionIndex(index);
    window.scrollTo({ top: document.getElementById('menu-builder')?.offsetTop, behavior: 'smooth' });
  };

  const deleteSection = (index: number) => {
    const newSections = menuSections.filter((_, i) => i !== index);
    setMenuSections(newSections);
    toast.success('Section deleted');
  };

  const cancelEdit = () => {
    setCurrentSection({ sectionName: '', items: [] });
    setEditingSectionIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check HTML5 validation (handle hidden fields)
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      const invalidElement = Array.from(form.elements).find(el => (el as HTMLInputElement).checkValidity() === false) as HTMLElement;
      if (invalidElement) {
        const section = invalidElement.closest('[id^="section"]');
        if (section) {
          const sectionId = section.id;
          // @ts-ignore
          if (sectionId && !expandedSections[sectionId]) {
            setExpandedSections(prev => ({ ...prev, [sectionId]: true }));
            setTimeout(() => {
              invalidElement.focus();
              // @ts-ignore
              if (invalidElement.reportValidity) invalidElement.reportValidity();
            }, 100);
            return;
          }
        }
        invalidElement.focus();
        // @ts-ignore
        if (invalidElement.reportValidity) invalidElement.reportValidity();
        return;
      }
    }

    if (purpose.length === 0 || ambienceType.length === 0 || amenities.length === 0) {
      toast.error('Please select at least one Purpose, Ambience, and Amenity');
      if (!expandedSections.section3) {
        setExpandedSections(prev => ({ ...prev, section3: true }));
        setTimeout(() => {
          document.getElementById('section3')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Add arrays as comma-separated strings
      formData.set('purpose', purpose.join(','));
      formData.set('ambienceType', ambienceType.join(','));
      formData.set('amenities', amenities.join(','));
      formData.set('foodDrinkTypes', foodDrinkTypes.join(','));

      // Add menu as JSON
      formData.set('menu', JSON.stringify(menuSections));

      // Add auto-calculated price range
      formData.set('priceRange', priceRange);

      // Add best 3 dishes
      const best3Dishes = [bestDish1, bestDish2, bestDish3].filter(d => d).join(',');
      formData.set('best3Dishes', best3Dishes);

      const response = await fetch('/api/submit-cafe', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Clear draft on successful submission
        localStorage.removeItem('kafumi-cafe-draft');
        localStorage.removeItem('kafumi-cafe-draft-time');

        toast.success('Café submitted successfully! We will review and add it soon.');
        router.push('/');
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        toast.error(result.message || 'Failed to submit café');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred while submitting');
    } finally {
      setLoading(false);
    }
  };

  const purposeOptions = [
    { value: 'Work & Unwind', icon: Coffee },
    { value: 'Family Outing', icon: Users },
    { value: 'Music & Night Out', icon: Music },
    { value: 'Hangout with Friends', icon: Users },
    { value: 'Date & Dine', icon: Heart },
    { value: 'Me-Time & Relax', icon: Coffee },
  ];

  const ambienceOptions = [
    { value: 'Aesthetic & Photogenic', icon: Camera },
    { value: 'Green & Serene', icon: TreePine },
    { value: 'Nightlife & Dancing', icon: Music },
    { value: 'Musical & Soulful', icon: Volume2 },
    { value: 'Quiet & Peaceful', icon: CloudSun },
    { value: 'Rooftop & Outdoor', icon: Building },
  ];

  const amenitiesOptions = [
    { value: 'Charging Ports', icon: Zap },
    { value: 'Free Wi-Fi', icon: Wifi },
    { value: 'Games', icon: Gamepad2 },
    { value: 'Parking', icon: Car },
    { value: 'Pet-Friendly', icon: PawPrint },
    { value: 'Smoking Area', icon: Cigarette },
  ];

  const foodDrinkOptions = [
    'Breakfast & Brunch',
    'Coffee & Beverages',
    'Desserts & Bakery',
    'Cocktails & Spirits',
  ];

  const cuisineOptions = [
    'Indian',
    'Italian',
    'Mexican',
    'Pan-Asian',
    'Continental',
    'Middle Eastern',
    'Global',
  ];

  const toggleSelection = (array: string[], setter: (arr: string[]) => void, value: string, max?: number) => {
    if (array.includes(value)) {
      setter(array.filter((item) => item !== value));
    } else {
      if (max && array.length >= max) {
        toast.error(`Maximum ${max} selections allowed`);
        return;
      }
      setter([...array, value]);
    }
  };

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    return `${h.toString().padStart(2, '0')}:${m}`;
  });

  const completedCount = Object.values(sectionCompletion).filter(Boolean).length;
  const totalSections = 5;

  return (
    <div className="min-h-screen bg-[#f7f1eb] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-[#faf9f7] to-[#faf9f7] py-12 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Draft Notice */}
        {showDraftNotice && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Save className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    We found a saved draft from {draftTime}
                  </p>
                  <p className="text-xs text-[#78492c] mt-1">
                    Your progress has been restored. Continue where you left off!
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDraftNotice(false)}
                  className="ml-auto"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex justify-center mb-4">
              <Image src="/kafumi-logo.png" alt="Kafumi" width={100} height={100} className="h-20 w-auto object-contain" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-amber-950 tracking-tight leading-tight">
                Submit Your Café
              </h1>
              <p className="text-lg text-muted-foreground/80 max-w-xl mx-auto leading-relaxed">
                Join Kafumi's curated collection. Share your unique vibe with our community of coffee lovers.
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="sticky top-6 z-50 mb-12 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 ring-1 ring-black/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-amber-950 tracking-wide uppercase font-serif">
                Completion Status
              </span>
              <span className="text-xs font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {completedCount} / {totalSections} Steps
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#78492c] to-orange-600 h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_0_10px_rgba(217,119,6,0.3)]"
                style={{ width: `${(completedCount / totalSections) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" noValidate>

            {/* Section 1: Basic Information */}
            <Card
              id="section1"
              className={`group border transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] rounded-2xl overflow-hidden ${expandedSections.section1
                ? 'ring-2 ring-[#79482a]/20 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] scale-[1.02] bg-white z-10'
                : sectionCompletion.section1
                  ? 'border-green-200 bg-green-50/40 hover:bg-green-50/60'
                  : 'border-white/40 bg-white/60 hover:bg-white hover:shadow-lg hover:border-amber-200'
                }`}
            >
              <CardHeader
                className="cursor-pointer hover:bg-amber-50/50 transition-colors rounded-t-lg"
                onClick={() => toggleSection('section1')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-300 ${sectionCompletion.section1
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200 rotate-0'
                      : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 shadow-md rotate-0 group-hover:rotate-6'
                      }`}>
                      {sectionCompletion.section1 ? <Check className="h-6 w-6" /> : '1'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold font-serif text-amber-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Café Details
                      </h3>
                      <p className="text-sm text-muted-foreground">Basic information and contact details</p>
                    </div>
                  </div>
                  {expandedSections.section1 ? (
                    <ChevronUp className="h-5 w-5 text-[#78492c]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#78492c]" />
                  )}
                </div>
              </CardHeader>

              <CardContent className={`space-y-6 pt-6 ${expandedSections.section1 ? '' : 'hidden'}`}>
                <div>
                  <Label htmlFor="cafeName" className="mb-2">Café Name *</Label>
                  <Input
                    id="cafeName"
                    name="cafeName"
                    required
                    value={formState.cafeName}
                    onChange={handleInputChange}
                    className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="contactNumberKafumi" className="mb-2">Contact Number for Kafumi (Private) *</Label>
                    <Input
                      id="contactNumberKafumi"
                      name="contactNumberKafumi"
                      type="tel"
                      required
                      value={formState.contactNumberKafumi}
                      onChange={handleInputChange}
                      className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Only visible to Kafumi team</p>
                  </div>
                  <div>
                    <Label htmlFor="contactNumberUsers" className="mb-2">Contact Number for Users (Public)</Label>
                    <Input
                      id="contactNumberUsers"
                      name="contactNumberUsers"
                      type="tel"
                      value={formState.contactNumberUsers}
                      onChange={handleInputChange}
                      className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Will be shown on your café page</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="city" className="mb-2">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      required
                      value={formState.city}
                      onChange={handleInputChange}
                      className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="mb-2">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      required
                      value={formState.address}
                      onChange={handleInputChange}
                      className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="googleMapsLink" className="mb-2">Google Maps Link *</Label>
                  <Input
                    id="googleMapsLink"
                    name="googleMapsLink"
                    type="url"
                    required
                    placeholder="https://maps.google.com/..."
                    value={formState.googleMapsLink}
                    onChange={handleInputChange}
                    className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">This will be used for the "Get Directions" button</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="email" className="mb-2">Email ID</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleInputChange}
                      className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram" className="mb-2">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      placeholder="@username"
                      value={formState.instagram}
                      onChange={handleInputChange}
                      className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="mb-2">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={formState.facebook}
                      onChange={handleInputChange}
                      className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website" className="mb-2">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formState.website}
                    onChange={handleInputChange}
                    className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => expandNextSection('section1')}
                    className="bg-[#78492c] hover:bg-amber-800"
                  >
                    Continue to Operating Details
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>

            </Card>

            {/* Section 2: Operating Details & Pricing */}
            <Card
              id="section2"
              className={`group border transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] rounded-2xl overflow-hidden ${expandedSections.section2
                ? 'ring-2 ring-[#79482a]/20 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] scale-[1.02] bg-white z-10'
                : sectionCompletion.section2
                  ? 'border-green-200 bg-green-50/40 hover:bg-green-50/60'
                  : 'border-white/40 bg-white/60 hover:bg-white hover:shadow-lg hover:border-amber-200'
                }`}
            >
              <CardHeader
                className="cursor-pointer hover:bg-amber-50/50 transition-colors rounded-t-lg"
                onClick={() => toggleSection('section2')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-300 ${sectionCompletion.section2
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200 rotate-0'
                      : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 shadow-md rotate-0 group-hover:rotate-6'
                      }`}>
                      {sectionCompletion.section2 ? <Check className="h-6 w-6" /> : '2'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold font-serif text-amber-900 flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        General Details
                      </h3>
                      <p className="text-sm text-muted-foreground">Operating hours and pricing information</p>
                    </div>
                  </div>
                  {expandedSections.section2 ? (
                    <ChevronUp className="h-5 w-5 text-[#78492c]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#78492c]" />
                  )}
                </div>
              </CardHeader>

              <CardContent className={`space-y-6 pt-6 ${expandedSections.section2 ? '' : 'hidden'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="openingHours" className="mb-2">Opening Hour *</Label>
                    <Select
                      value={formState.openingHours}
                      onValueChange={(value) => handleInputChange(value, 'openingHours')}
                      required
                    >
                      <SelectTrigger id="openingHours" className="w-full h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm">
                        <SelectValue placeholder="Select Opening Time (24h)" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {timeOptions.map((time) => (
                          <SelectItem key={`open-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="closingHours" className="mb-2">Closing Hour *</Label>
                    <Select
                      value={formState.closingHours}
                      onValueChange={(value) => handleInputChange(value, 'closingHours')}
                      required
                    >
                      <SelectTrigger id="closingHours" className="w-full h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm">
                        <SelectValue placeholder="Select Closing Time (24h)" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {timeOptions.map((time) => (
                          <SelectItem key={`close-${time}`} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="openingDays" className="mb-2">Opening Days</Label>
                  <Input
                    id="openingDays"
                    name="openingDays"
                    placeholder="e.g., Monday-Sunday"
                    value={formState.openingDays}
                    onChange={handleInputChange}
                    className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="avgPricePerPerson" className="mb-2">Average Price per Person (₹) *</Label>
                    <Input
                      id="avgPricePerPerson"
                      name="avgPricePerPerson"
                      type="number"
                      required
                      value={avgPrice}
                      onChange={(e) => handleAvgPriceChange(e.target.value)}
                      onBlur={saveDraft}
                      className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Price Range (Auto-filled)</Label>
                    <Input value={priceRange} readOnly disabled className="h-12 bg-muted" />
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Pure Veg? *</Label>
                  <RadioGroup name="pureVeg" required value={formState.pureVeg} onValueChange={(val) => handleInputChange(val, 'pureVeg')}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="vegYes" />
                        <Label htmlFor="vegYes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="vegNo" />
                        <Label htmlFor="vegNo">No</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="shortDescription" className="mb-2">Short Description (for home page)</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    placeholder="e.g., Artisanal coffee and homemade pastries."
                    rows={2}
                    value={formState.shortDescription}
                    onChange={handleInputChange}
                    className="resize-none"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => expandNextSection('section2')}
                    className="bg-[#78492c] hover:bg-amber-800"
                  >
                    Continue to Ambience & Amenities
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>

            </Card>

            {/* Section 3: Ambience & Amenities */}
            <Card
              id="section3"
              className={`group border transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] rounded-2xl overflow-hidden ${expandedSections.section3
                ? 'ring-2 ring-[#79482a]/20 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] scale-[1.02] bg-white z-10'
                : sectionCompletion.section3
                  ? 'border-green-200 bg-green-50/40 hover:bg-green-50/60'
                  : 'border-white/40 bg-white/60 hover:bg-white hover:shadow-lg hover:border-amber-200'
                }`}
            >
              <CardHeader
                className="cursor-pointer hover:bg-amber-50/50 transition-colors rounded-t-lg"
                onClick={() => toggleSection('section3')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-300 ${sectionCompletion.section3
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200 rotate-0'
                      : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 shadow-md rotate-0 group-hover:rotate-6'
                      }`}>
                      {sectionCompletion.section3 ? <Check className="h-6 w-6" /> : '3'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold font-serif text-amber-900 flex items-center gap-2">
                        <TreePine className="h-5 w-5" />
                        Ambience & Amenities
                      </h3>
                      <p className="text-sm text-muted-foreground">Define your cafe's vibe and features</p>
                    </div>
                  </div>
                  {expandedSections.section3 ? (
                    <ChevronUp className="h-5 w-5 text-[#78492c]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#78492c]" />
                  )}
                </div>
              </CardHeader>

              <CardContent className={`space-y-8 pt-6 ${expandedSections.section3 ? '' : 'hidden'}`}>
                <div>
                  <Label className="mb-2 text-base font-medium">Purpose (choose up to 2)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {purposeOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = purpose.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleSelection(purpose, setPurpose, option.value, 2)}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all min-h-[72px] duration-200 ${isSelected
                            ? 'border-[#79482a] bg-amber-50 shadow-md ring-1 ring-[#79482a]/50'
                            : 'border-amber-100 bg-white hover:border-amber-400 hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                        >
                          <Icon className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-[#78492c]' : 'text-[#79482a]'
                            }`} />
                          <span className={`text-sm font-medium text-left ${isSelected ? 'text-amber-900' : 'text-gray-700'
                            }`}>
                            {option.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 text-base font-medium">Ambience Type (choose up to 3)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {ambienceOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = ambienceType.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleSelection(ambienceType, setAmbienceType, option.value, 3)}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all min-h-[60px] ${isSelected
                            ? 'border-[#79482a] bg-amber-50 shadow-sm'
                            : 'border-amber-200 hover:border-amber-300 hover:bg-amber-50/50'
                            }`}
                        >
                          <Icon className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-[#78492c]' : 'text-[#79482a]'
                            }`} />
                          <span className={`text-sm font-medium text-left ${isSelected ? 'text-amber-900' : 'text-gray-700'
                            }`}>
                            {option.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="mb-2 text-base font-medium">Amenities (choose any)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {amenitiesOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = amenities.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleSelection(amenities, setAmenities, option.value)}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all min-h-[60px] ${isSelected
                            ? 'border-[#79482a] bg-amber-50 shadow-sm'
                            : 'border-amber-200 hover:border-amber-300 hover:bg-amber-50/50'
                            }`}
                        >
                          <Icon className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-[#78492c]' : 'text-[#79482a]'
                            }`} />
                          <span className={`text-sm font-medium text-left ${isSelected ? 'text-amber-900' : 'text-gray-700'
                            }`}>
                            {option.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => expandNextSection('section3')}
                    className="bg-[#78492c] hover:bg-amber-800"
                  >
                    Continue to Food & Menu
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>

            </Card>
            {/* Section 4: Food & Menu */}
            <Card
              id="section4"
              className={`group border transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] rounded-2xl overflow-hidden ${expandedSections.section4
                ? 'ring-2 ring-[#79482a]/20 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] scale-[1.02] bg-white z-10'
                : sectionCompletion.section4
                  ? 'border-green-200 bg-green-50/40 hover:bg-green-50/60'
                  : 'border-white/40 bg-white/60 hover:bg-white hover:shadow-lg hover:border-amber-200'
                }`}
            >
              <CardHeader
                className="cursor-pointer hover:bg-amber-50/50 transition-colors rounded-t-lg"
                onClick={() => toggleSection('section4')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-300 ${sectionCompletion.section4
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200 rotate-0'
                      : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 shadow-md rotate-0 group-hover:rotate-6'
                      }`}>
                      {sectionCompletion.section4 ? <Check className="h-6 w-6" /> : '4'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold font-serif text-amber-900 flex items-center gap-2">
                        <Utensils className="h-5 w-5" />
                        Food & Drinks
                      </h3>
                      <p className="text-sm text-muted-foreground">Menu categories and detailed listings</p>
                    </div>
                  </div>
                  {expandedSections.section4 ? (
                    <ChevronUp className="h-5 w-5 text-[#78492c]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#78492c]" />
                  )}
                </div>
              </CardHeader>

              <CardContent className={`space-y-8 pt-6 ${expandedSections.section4 ? '' : 'hidden'}`}>
                <div>
                  <Label className="mb-2 text-base font-medium">Type of Food & Drinks *</Label>
                  <p className="text-xs text-muted-foreground mb-3">Select the categories that best describe your offerings</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {foodDrinkOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border border-amber-200 hover:bg-amber-50/50 transition-colors">
                        <Checkbox
                          id={`food-${option}`}
                          checked={foodDrinkTypes.includes(option)}
                          onCheckedChange={() => toggleSelection(foodDrinkTypes, setFoodDrinkTypes, option)}
                        />
                        <Label htmlFor={`food-${option}`} className="text-sm font-medium cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Label className="mb-2 text-base font-medium">Cuisine Types (Optional)</Label>
                  <p className="text-xs text-muted-foreground mb-3">Select if you serve meals with specific cuisines. Leave blank for beverage/dessert-only cafés.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cuisineOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border border-amber-200 hover:bg-amber-50/50 transition-colors">
                        <Checkbox
                          id={`cuisine-${option}`}
                          checked={foodDrinkTypes.includes(option)}
                          onCheckedChange={() => toggleSelection(foodDrinkTypes, setFoodDrinkTypes, option)}
                        />
                        <Label htmlFor={`cuisine-${option}`} className="text-sm font-medium cursor-pointer">{option}</Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-900">
                    <strong>Note:</strong> "Global" is for fusion menus or international dishes that don't fit one specific cuisine.
                  </p>
                </div>

                {/* Menu Builder */}
                <div id="menu-builder" className="border-2 border-dashed border-amber-300/50 hover:border-amber-400/70 transition-colors rounded-2xl p-6 space-y-6 bg-gradient-to-br from-amber-50/40 to-orange-50/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-[#78492c]" />
                        Dynamic Menu Builder
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">Create menu sections and add your dishes</p>
                    </div>
                    {editingSectionIndex !== null && (
                      <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="sectionName" className="mb-2">Menu Section Name (e.g., Chinese, Beverages) *</Label>
                    <Input
                      id="sectionName"
                      value={currentSection.sectionName}
                      onChange={(e) => setCurrentSection({ ...currentSection, sectionName: e.target.value })}
                      placeholder="e.g., Chinese, Italian, Beverages"
                      className="h-12 bg-white"
                    />
                  </div>

                  {currentSection.items.map((item, index) => (
                    <div key={index} className="border-2 border-amber-200 rounded-lg p-4 space-y-3 bg-white shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm text-amber-900">Dish {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMenuItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <Input
                        placeholder="Dish Name *"
                        value={item.name}
                        onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                        className="h-11"
                      />

                      <Textarea
                        placeholder="Dish Description (optional)"
                        value={item.description}
                        onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                        rows={2}
                        className="resize-none"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <select
                          className="border rounded-lg p-2.5 text-sm bg-white h-11"
                          value={item.type}
                          onChange={(e) => updateMenuItem(index, 'type', e.target.value)}
                        >
                          <option value="Veg">Veg</option>
                          <option value="Non-Veg">Non-Veg</option>
                          <option value="Egg">Egg</option>
                        </select>

                        <Input
                          type="number"
                          placeholder="Price (₹) *"
                          value={item.price}
                          onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                          className="h-11"
                        />
                      </div>

                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`recommended-${index}`}
                          checked={item.recommended}
                          onCheckedChange={(checked) => updateMenuItem(index, 'recommended', checked)}
                        />
                        <Label htmlFor={`recommended-${index}`} className="text-sm">
                          Recommended (max 5 total)
                        </Label>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-4">
                    <Button type="button" onClick={addMenuItem} variant="outline" className="flex-1 py-6 border-2 border-amber-300 hover:bg-amber-50">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Dish
                    </Button>
                    <Button type="button" onClick={addOrUpdateSection} className="flex-1 py-6 bg-[#78492c] hover:bg-amber-800">
                      {editingSectionIndex !== null ? (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Section
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Save Section
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {menuSections.length > 0 && (
                  <div className="border-2 border-green-300 rounded-lg p-6 bg-green-50/50">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Added Sections:
                    </h4>
                    <div className="space-y-3">
                      {menuSections.map((section, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                          <div>
                            <p className="font-medium text-amber-900">{section.sectionName}</p>
                            <p className="text-sm text-muted-foreground">{section.items.length} dishes</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => editSection(idx)}
                              className="border-amber-300 hover:bg-amber-50"
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSection(idx)}
                              className="border-red-300 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="mb-2 block text-base font-medium">Best 3 Dishes (Select from your menu)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bestDish1" className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        🥇 Best Dish #1
                      </Label>
                      <Select value={bestDish1} onValueChange={setBestDish1}>
                        <SelectTrigger id="bestDish1" className="w-full h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm">
                          <SelectValue placeholder="Select dish" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllDishNames().map((dish) => (
                            <SelectItem key={dish} value={dish}>
                              {dish}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bestDish2" className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        🥈 Best Dish #2
                      </Label>
                      <Select value={bestDish2} onValueChange={setBestDish2}>
                        <SelectTrigger id="bestDish2" className="w-full h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm">
                          <SelectValue placeholder="Select dish" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllDishNames().map((dish) => (
                            <SelectItem key={dish} value={dish}>
                              {dish}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bestDish3" className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        🥉 Best Dish #3
                      </Label>
                      <Select value={bestDish3} onValueChange={setBestDish3}>
                        <SelectTrigger id="bestDish3" className="w-full h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm">
                          <SelectValue placeholder="Select dish" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllDishNames().map((dish) => (
                            <SelectItem key={dish} value={dish}>
                              {dish}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Add menu sections first, then select your best dishes</p>
                </div>

                <div>
                  <Label htmlFor="menuFile" className="mb-2">Upload Menu Files (Excel/PDF/Images, optional)</Label>
                  <Input id="menuFile" name="menuFile" type="file" accept=".xlsx,.xls,.pdf,image/*" multiple className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm" />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => expandNextSection('section4')}
                    className="bg-[#78492c] hover:bg-amber-800"
                  >
                    Continue to Visual Assets
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>

            </Card>

            {/* Section 5: Visual Assets & Consent */}
            <Card
              id="section5"
              className={`group border transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] rounded-2xl overflow-hidden ${expandedSections.section5
                ? 'ring-2 ring-[#79482a]/20 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] scale-[1.02] bg-white z-10'
                : sectionCompletion.section5
                  ? 'border-green-200 bg-green-50/40 hover:bg-green-50/60'
                  : 'border-white/40 bg-white/60 hover:bg-white hover:shadow-lg hover:border-amber-200'
                }`}
            >
              <CardHeader
                className="cursor-pointer hover:bg-amber-50/50 transition-colors rounded-t-lg"
                onClick={() => toggleSection('section5')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-300 ${sectionCompletion.section5
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200 rotate-0'
                      : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 shadow-md rotate-0 group-hover:rotate-6'
                      }`}>
                      {sectionCompletion.section5 ? <Check className="h-6 w-6" /> : '5'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold font-serif text-amber-900 flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Extras
                      </h3>
                      <p className="text-sm text-muted-foreground">Upload photos and give consent</p>
                    </div>
                  </div>
                  {expandedSections.section5 ? (
                    <ChevronUp className="h-5 w-5 text-[#78492c]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#78492c]" />
                  )}
                </div>
              </CardHeader>

              <CardContent className={`space-y-6 pt-6 ${expandedSections.section5 ? '' : 'hidden'}`}>
                <div>
                  <Label htmlFor="coverImage" className="mb-2 text-base font-medium">Cover Image (for café card) *</Label>
                  <div className="border-2 border-dashed border-amber-300/50 hover:border-amber-400/80 transition-all bg-amber-50/30 hover:bg-amber-50/50 rounded-2xl p-10 flex flex-col items-center justify-center group cursor-pointer">
                    <Input
                      id="coverImage"
                      name="coverImage"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      required
                      onChange={(e) => setHasCoverImage(e.target.files && e.target.files.length > 0 ? true : false)}
                      className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                    />
                    <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-2">
                      <Camera className="h-4 w-4" />
                      Take a photo or upload from gallery
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="photos" className="mb-2 text-base font-medium">Upload 4-5 Café Photos (ambience/food)</Label>
                  <div className="border-2 border-dashed border-amber-300/50 hover:border-amber-400/80 transition-all bg-amber-50/30 hover:bg-amber-50/50 rounded-2xl p-10 flex flex-col items-center justify-center group cursor-pointer">
                    <Input
                      id="photos"
                      name="photos"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={(e) => setHasPhotos(e.target.files && e.target.files.length > 0 ? true : false)}
                      className="h-14 bg-white border-amber-200 focus:border-[#79482a] focus:ring-4 focus:ring-[#79482a]/10 rounded-xl transition-all shadow-sm"
                    />
                    <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-2">
                      <Camera className="h-4 w-4" />
                      Select 4-5 images - Take photos or upload from gallery
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consent"
                      name="consent"
                      value="yes"
                      required
                      className="mt-1"
                      onCheckedChange={(checked) => setHasConsent(checked === true)}
                    />
                    <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                      I give Kafumi permission to use these details and photos on their platform *
                    </Label>
                  </div>
                </div>
              </CardContent>

            </Card>

            {/* Submit Button */}
            <div className="pt-8">
              <Button type="submit" className="w-full py-8 text-xl font-bold rounded-2xl bg-[#78492c] to-orange-600 hover:from-[#78492c] hover:to-orange-700 shadow-[0_20px_40px_-12px_rgba(217,119,6,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(217,119,6,0.5)] hover:scale-[1.01] transition-all duration-300" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-6 w-6" />
                    Submit Café
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                By submitting, you confirm all information is accurate and you have permission to share the provided images.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}