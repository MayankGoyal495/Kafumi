"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Sparkles, Home, Utensils } from "lucide-react"

const questions = [
  {
    id: 1,
    question: "What's the purpose of your visit?",
    options: [
      "Date & Dine",
      "Family Outing",
      "Hangout with Friends",
      "Me-Time & Relax",
      "Music & Night Out",
      "Work & Unwind",
    ],
  },
  {
    id: 2,
    question: "What kind of ambience are you looking for?",
    options: [
      "Aesthetic & Photogenic",
      "Green & Serene",
      "Nightlife & Dancing",
      "Musical & Soulful",
      "Quiet & Peaceful",
      "Rooftop & Outdoor",
    ],
    multiple: true,
  },
  {
    id: 3,
    question: "Which amenities do you need?",
    options: ["Charging Ports", "Free Wi-Fi", "Games", "Parking", "Pet-Friendly", "Smoking Area"],
    multiple: true,
  },
  {
    id: 4,
    question: "What type of food & drinks are you interested in?",
    options: [
      "Breakfast & Brunch",
      "Coffee & Beverages",
      "Desserts & Bakery",
      "Cocktails & Spirits",
    ],
    cuisineOptions: [
      "Indian",
      "Italian",
      "Mexican",
      "Pan-Asian",
      "Continental",
      "Middle Eastern",
      "Global",
    ],
    multiple: true,
    hasCuisine: true,
  },
  {
    id: 5,
    question: "How far are you willing to travel?",
    options: ["Walking ≤1km", "Short Ride ≤3km", "Nearby ≤6km", "Moderate ≤12km", "Anywhere 12km+"],
  },
  {
    id: 6,
    question: "What's your budget per person?",
    options: ["Budget Friendly – under ₹300", "Moderate – ₹300–₹600", "Mid-Range – ₹600–₹900", "Premium – ₹900+"],
  },
]

export default function GuidedSearchPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({})
  const [mandatoryFlags, setMandatoryFlags] = useState<Record<number, boolean>>({
    1: false, // Purpose - Optional by default
    2: false, // Ambience - Optional by default
    3: false, // Amenities - Optional by default
    4: false, // Food & Drinks - Optional by default
    5: false, // Distance - Optional by default
    6: false, // Price - Optional by default
  })
  const [location, setLocation] = useState("Bangalore")
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCuisineExpanded, setIsCuisineExpanded] = useState(false)
  const [showMandatoryToggle, setShowMandatoryToggle] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation")
    if (savedLocation) setLocation(savedLocation)
    
    const authToken = localStorage.getItem("authToken")
    const user = localStorage.getItem("user")
    setIsLoggedIn(!!(authToken || user))
  }, [])

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (option: string) => {
    if (question.multiple) {
      const currentAnswers = (answers[question.id] as string[]) || []
      const newAnswers = currentAnswers.includes(option)
        ? currentAnswers.filter((a) => a !== option)
        : [...currentAnswers, option]
      setAnswers({ ...answers, [question.id]: newAnswers })
    } else {
      setAnswers({ ...answers, [question.id]: option })
    }
  }

  const isAnswered = () => {
    const answer = answers[question.id]
    if (question.multiple) {
      return Array.isArray(answer) && answer.length > 0
    }
    return !!answer
  }

  const toggleMandatory = (questionId: number) => {
    setMandatoryFlags({
      ...mandatoryFlags,
      [questionId]: !mandatoryFlags[questionId]
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Save preferences and mandatory flags
      localStorage.setItem("guidedSearchPreferences", JSON.stringify(answers))
      localStorage.setItem("mandatoryFlags", JSON.stringify(mandatoryFlags))
      router.push("/guided/results")
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else {
      router.back()
    }
  }

  const isSelected = (option: string) => {
    const answer = answers[question.id]
    if (question.multiple) {
      return Array.isArray(answer) && answer.includes(option)
    }
    return answer === option
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Location:</span> {location}
          </div>
          {!isLoggedIn && (
            <Button variant="outline" size="sm" onClick={() => router.push("/auth")}>
              Sign In
            </Button>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-4 sm:py-8 max-w-3xl">
        <div className="space-y-6 sm:space-y-8">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card>
            <CardContent className="pt-6 space-y-6 p-4 sm:p-6">
              <div className="space-y-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-2 text-balance">
                    {question.question}
                  </h2>
                  {question.multiple && <p className="text-sm text-muted-foreground">Select all that apply</p>}
                </div>

                {/* Optional/Mandatory Toggle */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowMandatoryToggle({
                      ...showMandatoryToggle,
                      [question.id]: !showMandatoryToggle[question.id]
                    })}
                    className="w-full px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">⚙️ Filter Requirement</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${
                      showMandatoryToggle[question.id] ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {showMandatoryToggle[question.id] && (
                    <div className="p-4 bg-background border-t border-border space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleMandatory(question.id)}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                            !mandatoryFlags[question.id]
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          Optional
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMandatory(question.id)}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                            mandatoryFlags[question.id]
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          Mandatory
                        </button>
                      </div>
                      
                      <div className="text-xs space-y-2 text-muted-foreground">
                        <p>
                          <strong className="text-foreground">💡 Optional:</strong> Nice to have, improves match score
                        </p>
                        <p>
                          <strong className="text-foreground">🔒 Mandatory:</strong> Must have to appear in results
                          {question.id === 2 && <span className="block mt-1">• Café must match ANY selected ambience</span>}
                          {question.id === 3 && <span className="block mt-1">• Café must have ALL selected amenities</span>}
                          {question.id === 4 && <span className="block mt-1">• Café must have ANY selected food/drink type</span>}
                          {question.id === 6 && <span className="block mt-1">• Café must match this price range exactly</span>}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected(option)
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected(option) ? "border-primary bg-primary" : "border-border"
                          }`}
                        >
                          {isSelected(option) && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                        </div>
                        <span className="font-medium text-sm sm:text-base">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Cuisine Dropdown (only for question 4) */}
                {question.hasCuisine && question.cuisineOptions && (
                  <div className="border-2 border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setIsCuisineExpanded(!isCuisineExpanded)}
                      className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0">
                          {(() => {
                            const answer = answers[question.id]
                            const selectedCuisines = Array.isArray(answer) 
                              ? answer.filter(a => question.cuisineOptions.includes(a))
                              : []
                            return selectedCuisines.length > 0 && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )
                          })()}
                        </div>
                        <div>
                          <span className="font-medium text-sm sm:text-base">Cuisine</span>
                          {(() => {
                            const answer = answers[question.id]
                            const selectedCuisines = Array.isArray(answer) 
                              ? answer.filter(a => question.cuisineOptions.includes(a))
                              : []
                            return selectedCuisines.length > 0 && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({selectedCuisines.length} selected)
                              </span>
                            )
                          })()}
                        </div>
                      </div>
                      {isCuisineExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    {isCuisineExpanded && (
                      <div className="border-t border-border p-3 sm:p-4 bg-muted/30">
                        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                          {question.cuisineOptions.map((cuisine) => (
                            <button
                              key={cuisine}
                              onClick={() => handleAnswer(cuisine)}
                              className={`p-2 sm:p-3 rounded-lg border text-left transition-all text-sm ${
                                isSelected(cuisine)
                                  ? "border-primary bg-primary/5 text-foreground"
                                  : "border-border hover:border-primary/50 text-foreground bg-background"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected(cuisine) ? "border-primary bg-primary" : "border-border"
                                  }`}
                                >
                                  {isSelected(cuisine) && <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />}
                                </div>
                                <span className="font-medium">{cuisine}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3">
            <Button variant="outline" onClick={handleBack} className="gap-2 bg-transparent order-2 xs:order-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button onClick={handleNext} disabled={!isAnswered()} className="gap-2 order-1 xs:order-2">
              {currentQuestion < questions.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                "Show My Cafés"
              )}
            </Button>
          </div>

          {/* Other Ways to Explore - Sticky at bottom or collapsible */}
          <div className="mt-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="font-medium">Other Ways to Explore</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {isExpanded && (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mt-4 animate-in fade-in slide-in-from-top-2">
                <Button
                  variant="outline"
                  className="gap-2 h-auto py-3 flex-col"
                  onClick={() => router.push("/search-dish")}
                >
                  <Utensils className="h-5 w-5" />
                  <span className="text-xs">Search by Dish</span>
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 h-auto py-3 flex-col"
                  onClick={() => router.push("/home")}
                >
                  <Home className="h-5 w-5" />
                  <span className="text-xs">Explore All Cafés</span>
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 h-auto py-3 flex-col"
                  onClick={() => router.push("/random")}
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="text-xs">Random Café</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
