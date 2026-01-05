"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { feedbackService, type Feedback } from "@/lib/feedback-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Loader2, MessageSquare } from "lucide-react"

interface FeedbackSectionProps {
  cafeId: string
  cafeName: string
}

export function FeedbackSection({ cafeId, cafeName }: FeedbackSectionProps) {
  const router = useRouter()
  const { user, userData } = useAuth()
  
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest")
  
  // Form state
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    loadFeedback()
  }, [cafeId, sortBy])

  const loadFeedback = async () => {
    setLoading(true)
    const result = await feedbackService.getCafeFeedback(cafeId, sortBy)
    if (result.success && result.feedback) {
      setFeedback(result.feedback)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push("/auth")
      return
    }

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (comment.trim().length < 10) {
      setError("Please write at least 10 characters")
      return
    }

    setSubmitting(true)
    setError("")
    setSuccess("")

    const result = await feedbackService.createFeedback({
      cafeId,
      userId: user.uid,
      userName: userData?.displayName || userData?.email || "Anonymous",
      rating,
      comment: comment.trim()
    })

    if (result.success) {
      setSuccess("Thank you for your feedback!")
      setRating(0)
      setComment("")
      setShowForm(false)
      
      // IMPORTANT: Reload feedback immediately
      await loadFeedback()
      
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(result.error || "Failed to submit feedback")
    }

    setSubmitting(false)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    } catch {
      return ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-serif font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Reviews ({feedback.length})
        </h3>
        {!showForm && (
          <Button
            onClick={() => {
              if (!user) {
                router.push("/auth")
              } else {
                setShowForm(true)
              }
            }}
            size="sm"
          >
            Write Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Your Review</Label>
                <Textarea
                  id="comment"
                  placeholder={`Share your experience at ${cafeName}...`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {comment.length}/500 characters
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {success && (
                <p className="text-sm text-green-600">{success}</p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setRating(0)
                    setComment("")
                    setError("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sort Options */}
      {feedback.length > 0 && (
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "newest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("newest")}
            >
              Newest
            </Button>
            <Button
              variant={sortBy === "highest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("highest")}
            >
              Highest Rated
            </Button>
            <Button
              variant={sortBy === "lowest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("lowest")}
            >
              Lowest Rated
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : feedback.length > 0 ? (
        <div className="space-y-4">
          {feedback.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No reviews yet</p>
            <Button
              onClick={() => {
                if (!user) {
                  router.push("/auth")
                } else {
                  setShowForm(true)
                }
              }}
            >
              Be the First to Review
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
