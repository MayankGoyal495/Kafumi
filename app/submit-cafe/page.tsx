'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Loader2, Edit2, Save } from 'lucide-react';
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

export default function SubmitCafePage() {
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
        toast.success('Café submitted successfully! We will review and add it soon.');
        // Reset form
        e.currentTarget.reset();
        setMenuSections([]);
        setPurpose([]);
        setAmbienceType([]);
        setAmenities([]);
        setFoodDrinkTypes([]);
        setAvgPrice('');
        setPriceRange('');
        setBestDish1('');
        setBestDish2('');
        setBestDish3('');
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
    'Business / Professional',
    'Family Outing',
    'Fun Night Out',
    'Hangout with Friends',
    'Romantic Date',
    'Work / Study Alone',
  ];

  const ambienceOptions = [
    'Aesthetic & Instagrammable',
    'Green/Nature',
    'Modern/Trendy',
    'Music & Live Events',
    'Quiet & Peaceful',
    'Rooftop/Open-air',
  ];

  const amenitiesOptions = [
    'Charging Ports',
    'Free Wi-Fi',
    'Outdoor Seating',
    'Parking',
    'Pet-Friendly',
    'Pure Vegetarian',
  ];

  const foodDrinkOptions = [
    'Breakfast & Brunch',
    'Coffee & Beverages',
    'Desserts & Bakery',
    'Alcoholic Drinks',
    'All-rounder Menu',
    'Fine Dining',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Submit Your Café to Kafumi</CardTitle>
            <p className="text-center text-muted-foreground mt-2">
              Share your café details with us and get featured on Kafumi!
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Café Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">1️⃣ Café Details</h3>
                
                <div>
                  <Label htmlFor="cafeName">Café Name *</Label>
                  <Input id="cafeName" name="cafeName" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactNumberKafumi">Contact Number for Kafumi (Private) *</Label>
                    <Input id="contactNumberKafumi" name="contactNumberKafumi" type="tel" required />
                    <p className="text-xs text-muted-foreground mt-1">Only visible to Kafumi team</p>
                  </div>
                  <div>
                    <Label htmlFor="contactNumberUsers">Contact Number for Users (Public)</Label>
                    <Input id="contactNumberUsers" name="contactNumberUsers" type="tel" />
                    <p className="text-xs text-muted-foreground mt-1">Will be shown on your café page</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" required />
                  </div>
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input id="address" name="address" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="googleMapsLink">Google Maps Link *</Label>
                  <Input id="googleMapsLink" name="googleMapsLink" type="url" required placeholder="https://maps.google.com/..." />
                  <p className="text-xs text-muted-foreground mt-1">This will be used for the "Get Directions" button</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="email">Email ID</Label>
                    <Input id="email" name="email" type="email" />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input id="instagram" name="instagram" placeholder="@username" />
                  </div>
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input id="facebook" name="facebook" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" type="url" />
                </div>
              </div>

              {/* General Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">2️⃣ General Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openingHours">Opening Hours (24hr format) *</Label>
                    <Input id="openingHours" name="openingHours" type="time" required />
                  </div>
                  <div>
                    <Label htmlFor="closingHours">Closing Hours (24hr format) *</Label>
                    <Input id="closingHours" name="closingHours" type="time" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="openingDays">Opening Days</Label>
                  <Input id="openingDays" name="openingDays" placeholder="e.g., Monday-Sunday" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="avgPricePerPerson">Average Price per Person (₹) *</Label>
                    <Input
                      id="avgPricePerPerson"
                      name="avgPricePerPerson"
                      type="number"
                      required
                      value={avgPrice}
                      onChange={(e) => handleAvgPriceChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Price Range (Auto-filled)</Label>
                    <Input value={priceRange} readOnly disabled />
                  </div>
                </div>

                <div>
                  <Label>Pure Veg? *</Label>
                  <RadioGroup name="pureVeg" required>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="vegYes" />
                      <Label htmlFor="vegYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="vegNo" />
                      <Label htmlFor="vegNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description (for home page)</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    placeholder="e.g., Artisanal coffee and homemade pastries."
                    rows={2}
                  />
                </div>
              </div>

              {/* Ambience & Amenities */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">3️⃣ Ambience & Amenities</h3>
                
                <div>
                  <Label>Purpose (choose up to 2)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {purposeOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`purpose-${option}`}
                          checked={purpose.includes(option)}
                          onCheckedChange={() => toggleSelection(purpose, setPurpose, option, 2)}
                        />
                        <Label htmlFor={`purpose-${option}`} className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Ambience Type (choose up to 3)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {ambienceOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`ambience-${option}`}
                          checked={ambienceType.includes(option)}
                          onCheckedChange={() => toggleSelection(ambienceType, setAmbienceType, option, 3)}
                        />
                        <Label htmlFor={`ambience-${option}`} className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Amenities (choose any)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {amenitiesOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${option}`}
                          checked={amenities.includes(option)}
                          onCheckedChange={() => toggleSelection(amenities, setAmenities, option)}
                        />
                        <Label htmlFor={`amenity-${option}`} className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Food & Drinks */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">4️⃣ Food & Drinks</h3>
                
                <div>
                  <Label>Type of Food & Drinks *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {foodDrinkOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`food-${option}`}
                          checked={foodDrinkTypes.includes(option)}
                          onCheckedChange={() => toggleSelection(foodDrinkTypes, setFoodDrinkTypes, option)}
                        />
                        <Label htmlFor={`food-${option}`} className="text-sm">{option}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Menu Builder */}
                <div id="menu-builder" className="border rounded-lg p-4 space-y-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Dynamic Menu Builder</h4>
                    {editingSectionIndex !== null && (
                      <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="sectionName">Menu Section Name (e.g., Chinese, Beverages) *</Label>
                    <Input
                      id="sectionName"
                      value={currentSection.sectionName}
                      onChange={(e) => setCurrentSection({ ...currentSection, sectionName: e.target.value })}
                      placeholder="e.g., Chinese, Italian, Beverages"
                    />
                  </div>

                  {currentSection.items.map((item, index) => (
                    <div key={index} className="border rounded p-3 space-y-2 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Dish {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMenuItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Input
                        placeholder="Dish Name *"
                        value={item.name}
                        onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                      />
                      
                      <Textarea
                        placeholder="Dish Description (optional)"
                        value={item.description}
                        onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                        rows={2}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="border rounded p-2 text-sm"
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
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
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

                  <div className="flex gap-2">
                    <Button type="button" onClick={addMenuItem} variant="outline" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Dish
                    </Button>
                    <Button type="button" onClick={addOrUpdateSection} className="flex-1">
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
                  <div className="border rounded-lg p-4 bg-green-50">
                    <h4 className="font-semibold mb-3">Added Sections:</h4>
                    <div className="space-y-2">
                      {menuSections.map((section, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border">
                          <div>
                            <p className="font-medium">{section.sectionName}</p>
                            <p className="text-sm text-muted-foreground">{section.items.length} dishes</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => editSection(idx)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSection(idx)}
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
                  <Label className="mb-2 block">Best 3 Dishes (Select from your menu)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="bestDish1" className="text-xs text-muted-foreground">Best Dish #1</Label>
                      <Select value={bestDish1} onValueChange={setBestDish1}>
                        <SelectTrigger id="bestDish1">
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
                      <Label htmlFor="bestDish2" className="text-xs text-muted-foreground">Best Dish #2</Label>
                      <Select value={bestDish2} onValueChange={setBestDish2}>
                        <SelectTrigger id="bestDish2">
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
                      <Label htmlFor="bestDish3" className="text-xs text-muted-foreground">Best Dish #3</Label>
                      <Select value={bestDish3} onValueChange={setBestDish3}>
                        <SelectTrigger id="bestDish3">
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
                  <p className="text-xs text-muted-foreground mt-1">Add menu sections first, then select your best dishes</p>
                </div>

                <div>
                  <Label htmlFor="menuFile">Upload Menu File (Excel/PDF, optional)</Label>
                  <Input id="menuFile" name="menuFile" type="file" accept=".xlsx,.xls,.pdf" />
                </div>
              </div>

              {/* Extras */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">5️⃣ Extras</h3>
                
                <div>
                  <Label htmlFor="coverImage">Cover Image (for café card) *</Label>
                  <Input id="coverImage" name="coverImage" type="file" accept="image/*" required />
                </div>

                <div>
                  <Label htmlFor="photos">Upload 4-5 Café Photos (ambience/food) *</Label>
                  <Input id="photos" name="photos" type="file" accept="image/*" multiple required />
                  <p className="text-xs text-muted-foreground mt-1">Select 4-5 images</p>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="consent" name="consent" value="yes" required />
                  <Label htmlFor="consent" className="text-sm">
                    I give Kafumi permission to use these details and photos on their platform *
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Submit Café
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
