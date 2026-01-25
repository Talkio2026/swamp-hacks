'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { UserProfile } from '@clerk/nextjs'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Sparkles,
  Check,
  Loader2,
  Calendar,
  ExternalLink,
  X,
} from 'lucide-react'

interface AIModel {
  id: string
  provider: 'gemini' | 'openrouter'
  name: string
  description: string
}

interface AISettings {
  provider: 'gemini' | 'openrouter'
  openRouterModel?: string
}

interface GoogleCalendarSettings {
  connected: boolean
}

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [selectedModel, setSelectedModel] = useState<string>('gemini')
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Google Calendar state
  const [googleCalendar, setGoogleCalendar] = useState<GoogleCalendarSettings>({ connected: false })
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false)
  const [isDisconnectingGoogle, setIsDisconnectingGoogle] = useState(false)
  const [googleMessage, setGoogleMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Check for Google OAuth callback results
  useEffect(() => {
    const googleSuccess = searchParams.get('google_success')
    const googleError = searchParams.get('google_error')
    
    if (googleSuccess === 'true') {
      setGoogleMessage({ type: 'success', text: 'Google Calendar connected successfully!' })
      setGoogleCalendar({ connected: true })
      // Clear URL params
      window.history.replaceState({}, '', '/settings')
    } else if (googleError) {
      const errorMessages: Record<string, string> = {
        access_denied: 'Google Calendar access was denied.',
        invalid_callback: 'Invalid callback. Please try again.',
        no_token: 'Failed to get authorization token.',
        callback_failed: 'Connection failed. Please try again.',
      }
      setGoogleMessage({ type: 'error', text: errorMessages[googleError] || 'Connection failed.' })
      window.history.replaceState({}, '', '/settings')
    }
  }, [searchParams])

  // Fetch current settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        
        if (data.settings?.aiModel) {
          const aiModel = data.settings.aiModel as AISettings
          if (aiModel.provider === 'gemini') {
            setSelectedModel('gemini')
          } else if (aiModel.openRouterModel) {
            setSelectedModel(aiModel.openRouterModel)
          }
        }
        
        if (data.settings?.googleCalendar) {
          setGoogleCalendar(data.settings.googleCalendar)
        }
        
        if (data.availableModels) {
          setAvailableModels(data.availableModels)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSettings()
  }, [])

  // Debug: Measure centering of Profile Settings Clerk component
  useEffect(() => {
    // #region agent log
    const measureCentering = () => {
      const card = document.querySelector('[class*="Card"][class*="Profile Settings"]')?.closest('[class*="Card"]') || 
                   Array.from(document.querySelectorAll('[class*="Card"]')).find(el => {
                     const title = el.querySelector('[class*="CardTitle"]');
                     return title?.textContent?.includes('Profile Settings');
                   });
      const cardContent = card?.querySelector('[class*="CardContent"]');
      const wrapperDiv = cardContent?.querySelector('div');
      const clerkRoot = document.querySelector('.cl-userProfile');
      const clerkCardBox = clerkRoot?.querySelector('.cl-cardBox');
      
      if (card && cardContent && wrapperDiv) {
        const cardRect = card.getBoundingClientRect();
        const contentRect = cardContent.getBoundingClientRect();
        const wrapperRect = wrapperDiv.getBoundingClientRect();
        const clerkRootRect = clerkRoot?.getBoundingClientRect();
        const clerkCardBoxRect = clerkCardBox?.getBoundingClientRect();
        
        const cardCenter = cardRect.left + cardRect.width / 2;
        const contentCenter = contentRect.left + contentRect.width / 2;
        const wrapperCenter = wrapperRect.left + wrapperRect.width / 2;
        const clerkRootCenter = clerkRootRect ? clerkRootRect.left + clerkRootRect.width / 2 : null;
        const clerkCardBoxCenter = clerkCardBoxRect ? clerkCardBoxRect.left + clerkCardBoxRect.width / 2 : null;
        
        const contentStyles = window.getComputedStyle(cardContent);
        const wrapperStyles = window.getComputedStyle(wrapperDiv);
        const clerkRootStyles = clerkRoot ? window.getComputedStyle(clerkRoot) : null;
        const clerkCardBoxStyles = clerkCardBox ? window.getComputedStyle(clerkCardBox) : null;
        
        fetch('http://127.0.0.1:7242/ingest/a4918017-0b21-4e17-ac77-6519ee12f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'settings/page.tsx:103',message:'Centering measurements',data:{cardWidth:cardRect.width,cardLeft:cardRect.left,cardCenter,contentWidth:contentRect.width,contentLeft:contentRect.left,contentCenter,contentOffsetFromCard:Math.abs(contentCenter-cardCenter),contentDisplay:contentStyles.display,contentJustifyContent:contentStyles.justifyContent,contentAlignItems:contentStyles.alignItems,contentFlexDirection:contentStyles.flexDirection,wrapperWidth:wrapperRect.width,wrapperLeft:wrapperRect.left,wrapperCenter,wrapperOffsetFromCard:Math.abs(wrapperCenter-cardCenter),wrapperMaxWidth:wrapperStyles.maxWidth,wrapperWidthStyle:wrapperStyles.width,wrapperMargin:wrapperStyles.margin,wrapperMarginLeft:wrapperStyles.marginLeft,wrapperMarginRight:wrapperStyles.marginRight,clerkRootWidth:clerkRootRect?.width,clerkRootLeft:clerkRootRect?.left,clerkRootCenter,clerkRootOffsetFromCard:clerkRootCenter?Math.abs(clerkRootCenter-cardCenter):null,clerkRootWidthStyle:clerkRootStyles?.width,clerkRootMargin:clerkRootStyles?.margin,clerkCardBoxWidth:clerkCardBoxRect?.width,clerkCardBoxLeft:clerkCardBoxRect?.left,clerkCardBoxCenter,clerkCardBoxOffsetFromCard:clerkCardBoxCenter?Math.abs(clerkCardBoxCenter-cardCenter):null,clerkCardBoxWidthStyle:clerkCardBoxStyles?.width,clerkCardBoxMargin:clerkCardBoxStyles?.margin},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      }
    };
    
    // Measure after delays to allow Clerk to render
    const timer1 = setTimeout(measureCentering, 1000);
    const timer2 = setTimeout(measureCentering, 3000);
    const timer3 = setTimeout(measureCentering, 5000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
    // #endregion
  }, [])

  // Connect Google Calendar
  const handleConnectGoogle = () => {
    setIsConnectingGoogle(true)
    window.location.href = '/api/auth/google'
  }

  // Disconnect Google Calendar
  const handleDisconnectGoogle = async () => {
    setIsDisconnectingGoogle(true)
    setGoogleMessage(null)
    
    try {
      const response = await fetch('/api/auth/google/disconnect', { method: 'POST' })
      
      if (response.ok) {
        setGoogleCalendar({ connected: false })
        setGoogleMessage({ type: 'success', text: 'Google Calendar disconnected.' })
      } else {
        setGoogleMessage({ type: 'error', text: 'Failed to disconnect. Please try again.' })
      }
    } catch (error) {
      console.error('Error disconnecting Google:', error)
      setGoogleMessage({ type: 'error', text: 'Failed to disconnect. Please try again.' })
    } finally {
      setIsDisconnectingGoogle(false)
    }
  }

  // Save AI model preference
  const handleSaveModel = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiModelId: selectedModel }),
      })
      
      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Settings" 
        description="Manage your organization settings"
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Account Component */}
          <div className="flex justify-center items-start py-6">
            <div className="w-full max-w-2xl mx-auto flex justify-center">
              <UserProfile 
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: 'w-full flex justify-center mx-auto',
                    cardBox: 'shadow-none border-0 w-full mx-auto flex justify-center',
                    card: 'w-full mx-auto',
                    navbar: 'hidden',
                    navbarMobileMenuButton: 'hidden',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    profileSectionTitleText: 'text-lg font-bold',
                    // Account section styling - center it
                    accountSwitcherTrigger: 'text-base font-semibold mx-auto',
                    accountSwitcherTriggerText: 'text-base font-semibold',
                    // Navigation items
                    navbarButton: 'text-base font-medium',
                    navbarButtonText: 'text-base font-medium',
                    // Content sections - center content
                    page: 'w-full mx-auto',
                    pageScrollBox: 'w-full mx-auto',
                    pageHeaderTitle: 'text-xl font-bold text-center',
                    pageHeaderSubtitle: 'hidden',
                    formFieldLabel: 'text-base font-semibold',
                    formFieldInput: 'text-base',
                    formButtonPrimary: 'text-base font-semibold',
                    // Profile info - center profile section
                    profileSection: 'text-base mx-auto',
                    profileSectionContent: 'mx-auto',
                    profileSectionPrimaryButton: 'text-base font-semibold mx-auto',
                    // Email and connected accounts
                    formFieldLabelRow: 'text-base font-semibold',
                    badge: 'text-sm font-medium',
                  },
                }}
              />
            </div>
          </div>

          {/* AI Model Settings */}
          <div className="flex justify-center items-start py-6">
            <div className="w-full max-w-2xl mx-auto flex justify-center">
              <Card className="w-full">
                <CardHeader className="bg-violet-50 px-6 py-5">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI Summarizer Model
                  </CardTitle>
                  <CardDescription>
                    Choose the AI model used for analyzing call transcripts. This affects all future analyses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6 py-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid gap-3">
                    {availableModels.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`
                          flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all
                          ${selectedModel === model.id 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                            : 'hover:border-muted-foreground/50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-4 h-4 rounded-full border-2 flex items-center justify-center
                            ${selectedModel === model.id ? 'border-primary bg-primary' : 'border-muted-foreground'}
                          `}>
                            {selectedModel === model.id && (
                              <Check className="h-2.5 w-2.5 text-primary-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {model.name}
                              <Badge variant="outline" className="text-xs">
                                {model.provider === 'gemini' ? 'Google' : 'OpenRouter'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">{model.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <Button 
                      onClick={handleSaveModel} 
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Saved!
                        </>
                      ) : (
                        'Save Model Preference'
                      )}
                    </Button>
                    {saveSuccess && (
                      <span className="text-sm text-green-600">
                        Model preference updated successfully
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: OpenRouter models require an OpenRouter API key. Gemini is the default if no OpenRouter key is configured.
                  </p>
                </>
              )}
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
