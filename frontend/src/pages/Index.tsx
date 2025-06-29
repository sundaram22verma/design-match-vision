import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Link, AlertCircle, CheckCircle, XCircle } from "lucide-react";

// API URL from environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1010';

interface ComparisonResult {
  matchScore: string;
  misMatchPercentage: string;
  analysisTime: string;
  originalImages?: {
    figma?: string;
    code?: string;
  };
  diffImagePath?: string;
}

const Index = () => {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState("");
  const [figmaFile, setFigmaFile] = useState<File | null>(null);
  const [inputMethod, setInputMethod] = useState("url"); // "url" or "file"
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFigmaFile(file);
      setFigmaUrl(""); // Clear URL when file is selected
      setError(""); // Clear any previous errors
    } else {
      setError("Please select a valid image file (PNG, JPG, etc.)");
      setFigmaFile(null);
    }
  };

  const handleCompare = async () => {
    setIsComparing(true);
    setError("");
    
    try {
      let requestBody: { pageUrl: string; figmaImageUrl?: string } = {
        pageUrl: pageUrl
      };

      if (inputMethod === "file" && figmaFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('figmaImage', figmaFile);
        formData.append('pageUrl', pageUrl);

        const response = await fetch(`${API_BASE_URL}/compare-file`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to compare images');
        }

        const result = await response.json();
        setComparisonResult(result);
        setShowResults(true);
      } else {
        // Handle URL
        requestBody.figmaImageUrl = figmaUrl;

        const response = await fetch(`${API_BASE_URL}/compare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to compare images');
        }

        const result = await response.json();
        setComparisonResult(result);
        setShowResults(true);
      }
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during comparison');
    } finally {
      setIsComparing(false);
    }
  };

  const getMatchScoreColor = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return "text-green-600";
    if (numScore >= 80) return "text-blue-600";
    if (numScore >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getMatchScoreIcon = (score: string) => {
    const numScore = parseFloat(score);
    if (numScore >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (numScore >= 80) return <CheckCircle className="w-5 h-5 text-blue-600" />;
    if (numScore >= 70) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              DesignChecker
            </h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Beta
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Compare Figma Designs with Live Pages
          </h2>
          <p className="text-1lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 mt-4">
            Upload your Figma design and compare it pixel-by-pixel with your developed page. 
            Get instant visual diff analysis and match scores.
          </p>
        </div>

        {!showResults ? (
          /* Input Form */
          <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">Start Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Figma Design Input Method
                </Label>
                <Tabs value={inputMethod} onValueChange={setInputMethod} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      URL
                    </TabsTrigger>
                    <TabsTrigger value="file" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url" className="space-y-2">
                    <Input
                      id="figma-url"
                      placeholder="https://figma.com/file/... or direct image URL"
                      value={figmaUrl}
                      onChange={(e) => setFigmaUrl(e.target.value)}
                      className="h-12"
                      disabled={isComparing}
                    />
                    <p className="text-xs text-gray-500">
                      Paste your Figma design URL (with node-id) or a direct image URL. 
                      The system will automatically convert Figma URLs to images.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="file" className="space-y-2">
                    <div className="relative">
                      <Input
                        id="figma-file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="h-12 cursor-pointer"
                        disabled={isComparing}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Upload className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Upload your Figma design as an image file (PNG, JPG, etc.).
                      Export your design from Figma and upload it here.
                    </p>
                    {figmaFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        File selected: {figmaFile.name}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-url" className="text-sm font-medium text-gray-700">
                  Live Page URL
                </Label>
                <Input
                  id="page-url"
                  placeholder="https://yoursite.com or http://localhost:3000"
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  className="h-12"
                  disabled={isComparing}
                />
                <p className="text-xs text-gray-500">
                  URL of your deployed page or local development server
                </p>
              </div>

              <Button 
                onClick={handleCompare}
                disabled={
                  !pageUrl || 
                  isComparing || 
                  (inputMethod === "url" && !figmaUrl) ||
                  (inputMethod === "file" && !figmaFile)
                }
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isComparing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  "Compare Design"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                  <br />
                  Please check your URLs and try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Match Score Header */}
            {comparisonResult && (
              <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 sm:px-8 py-4 shadow-lg border">
                  <div className={`text-2xl sm:text-3xl font-bold ${getMatchScoreColor(comparisonResult.matchScore)}`}>
                    {comparisonResult.matchScore}%
                  </div>
                  <div className="text-gray-600">
                    <div className="font-semibold">Match Score</div>
                    <div className="text-sm">
                      {parseFloat(comparisonResult.matchScore) >= 90 ? 'Excellent match!' :
                       parseFloat(comparisonResult.matchScore) >= 80 ? 'Great implementation!' :
                       parseFloat(comparisonResult.matchScore) >= 70 ? 'Good match' : 'Needs improvement'}
                    </div>
                  </div>
                  {getMatchScoreIcon(comparisonResult.matchScore)}
                </div>
              </div>
            )}

            {/* Comparison Results */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-4">
                  <span>Visual Comparison</span>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowResults(false);
                      setComparisonResult(null);
                      setError("");
                    }}
                    className="text-sm"
                  >
                    New Comparison
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="side-by-side" className="w-full">
                  <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                    <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
                    <TabsTrigger value="overlay">Overlay</TabsTrigger>
                    <TabsTrigger value="differences">Differences</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="side-by-side" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800">Figma Design</h3>
                        {comparisonResult?.originalImages?.figma ? (
                          <div className="aspect-[4/3] rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                            <img 
                              src={`${API_BASE_URL}${comparisonResult.originalImages.figma}`}
                              alt="Figma Design"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg border-2 border-dashed border-blue-300 items-center justify-center">
                              <div className="text-center text-gray-500">
                                <div className="text-4xl mb-2">🎨</div>
                                <div>Figma Design Preview</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <div className="text-4xl mb-2">🎨</div>
                              <div>Figma Design Preview</div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-800">Live Page</h3>
                        {comparisonResult?.originalImages?.code ? (
                          <div className="aspect-[4/3] rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                            <img 
                              src={`${API_BASE_URL}${comparisonResult.originalImages.code}`}
                              alt="Live Page Screenshot"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg border-2 border-dashed border-green-300 items-center justify-center">
                              <div className="text-center text-gray-500">
                                <div className="text-4xl mb-2">💻</div>
                                <div>Screenshot Preview</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg border-2 border-dashed border-green-300 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <div className="text-4xl mb-2">💻</div>
                              <div>Screenshot Preview</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="overlay" className="mt-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800">Overlay Comparison</h3>
                      {comparisonResult?.originalImages?.figma && comparisonResult?.originalImages?.code ? (
                        <div className="relative aspect-[4/3] rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                          {/* Background Image (Live Page) */}
                          <img 
                            src={`${API_BASE_URL}${comparisonResult.originalImages.code}`}
                            alt="Live Page Screenshot"
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                          {/* Overlay Image (Figma Design) */}
                          <img 
                            src={`${API_BASE_URL}${comparisonResult.originalImages.figma}`}
                            alt="Figma Design"
                            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
                            style={{ opacity: overlayOpacity }}
                          />
                          {/* Overlay Controls */}
                          <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                            <div className="flex items-center justify-between text-white text-sm mb-2">
                              <span>Live Page</span>
                              <span>Figma Design</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={overlayOpacity}
                              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                              aria-label="Overlay opacity control"
                            />
                            <div className="flex justify-between text-xs text-gray-300 mt-1">
                              <span>0%</span>
                              <span>{Math.round(overlayOpacity * 100)}%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border-2 border-dashed border-purple-300 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">🔄</div>
                            <div>Overlay View</div>
                            <div className="text-sm mt-1">Both images required for overlay comparison</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="differences" className="mt-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800">Visual Differences</h3>
                      {comparisonResult?.diffImagePath ? (
                        <div className="aspect-[4/3] rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50">
                          <img 
                            src={`${API_BASE_URL}${comparisonResult.diffImagePath}`}
                            alt="Visual Differences"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="hidden w-full h-full bg-gradient-to-br from-red-100 to-orange-100 rounded-lg border-2 border-dashed border-red-300 items-center justify-center">
                            <div className="text-center text-gray-500">
                              <div className="text-4xl mb-2">🔍</div>
                              <div>Difference Highlights</div>
                              <div className="text-sm mt-1">Red areas show discrepancies</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-gradient-to-br from-red-100 to-orange-100 rounded-lg border-2 border-dashed border-red-300 flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-2">🔍</div>
                            <div>Difference Highlights</div>
                            <div className="text-sm mt-1">Red areas show discrepancies</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator className="my-6" />

                {/* Analysis Details */}
                {comparisonResult && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {comparisonResult.misMatchPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">Difference Percentage</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {comparisonResult.matchScore}%
                      </div>
                      <div className="text-sm text-gray-600">Match Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg sm:col-span-2 lg:col-span-1">
                      <div className="text-sm text-gray-600">
                        Analyzed at: {new Date(comparisonResult.analysisTime).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Overview */}
        {!showResults && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📷</span>
              </div>
              <h3 className="font-semibold mb-2">Automated Screenshots</h3>
              <p className="text-gray-600 text-sm">
                Automatically captures screenshots of your live pages using headless browser technology
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold mb-2">Pixel-Perfect Analysis</h3>
              <p className="text-gray-600 text-sm">
                Advanced image comparison algorithms detect even the smallest visual differences
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold mb-2">Detailed Reports</h3>
              <p className="text-gray-600 text-sm">
                Get comprehensive reports with match scores and highlighted differences
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
