# 🎬 UgFlix Frontend Integration Plan

## 📋 **COMPREHENSIVE API ANALYSIS & INTEGRATION ROADMAP**

Based on thorough analysis of the Laravel backend, Flutter mobile app patterns, and React frontend structure, here's the complete integration plan for UgFlix streaming platform.

---

## 🚀 **BACKEND API ANALYSIS**

### **🔐 Authentication Endpoints**
```
POST /api/auth/login
POST /api/auth/register  
POST /api/auth/password-reset
POST /api/auth/request-password-reset-code
GET /api/me (requires JWT token)
```

**Authentication Flow:**
- JWT-based authentication using Tymon/JWT package
- Token expires in 5 years (60 * 24 * 365 * 5)
- Headers: `Authorization: Bearer {token}` and `logged_in_user_id`

### **🎥 Core Movie/Streaming Endpoints**
```
GET /api/movies (authenticated)
GET /api/manifest (authenticated) - Main content feed
GET /api/api/{model} - Generic model listing
POST /api/api/{model} - Generic model updates
```

**Movies API Response Structure:**
```json
{
  "code": 1,
  "message": "Movies retrieved successfully.",
  "data": {
    "items": [...],
    "pagination": {
      "current_page": 1,
      "per_page": 21,
      "total": 150,
      "last_page": 8
    }
  }
}
```

### **🎯 Key Movie Filters Available:**
- `title` - Search by movie title
- `category` - Filter by series category
- `genre` - Filter by genre
- `year` - Filter by release year  
- `type` - "Movie" or "Series"
- `is_premium` - Premium content filter
- `is_first_episode` - Series first episodes only
- `sort_by` / `sort_dir` - Sorting options

### **📱 Mobile-Specific Features**
- Platform detection (`platform_type`: "ios" | "android")  
- View progress tracking via `/api/save-view-progress`
- Content moderation and reporting system
- Chat/messaging functionality
- File upload capabilities

---

## 🔄 **FLUTTER APP PATTERNS ANALYSIS**

### **📡 HTTP Service Pattern**
The Flutter app uses a sophisticated HTTP service pattern we should replicate:

```dart
// API Base Configuration
BASE_URL: "http://10.0.2.2:8888/katogo"  
API_BASE_URL: "$BASE_URL/api"

// HTTP Methods Used
static Future<dynamic> http_get(String path, Map<String, dynamic> body)
static Future<dynamic> http_post(String path, Map<String, dynamic> body)

// Headers Pattern
{
  "Authorization": "Bearer $token",
  "logged_in_user_id": user.id.toString(),
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### **🏗️ Service Architecture**
1. **ManifestService**: Handles main content feed with caching
2. **Utils Class**: Core HTTP operations and utilities
3. **RespondModel**: Standardized API response handling
4. **Local Caching**: SharedPreferences for offline data

---

## 🎯 **REACT INTEGRATION STRATEGY**

### **Phase 1: Core API Integration (Week 1)**

#### **1.1 Create API Service Layer**
```typescript
// src/services/ApiService.ts
class ApiService {
  private baseURL = "http://localhost:8888/katogo";
  private apiURL = `${this.baseURL}/api`;
  
  async get<T>(endpoint: string, params?: any): Promise<T>
  async post<T>(endpoint: string, data?: any): Promise<T>
  
  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse>
  async register(userData: RegisterRequest): Promise<AuthResponse>
  async getProfile(): Promise<UserProfile>
  
  // Movies methods  
  async getMovies(filters?: MovieFilters): Promise<MoviesResponse>
  async getManifest(): Promise<ManifestResponse>
  async saveViewProgress(data: ViewProgressData): Promise<void>
}
```

#### **1.2 Authentication System**
```typescript
// src/context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Storage pattern matching Flutter app
localStorage.setItem('token', token);
localStorage.setItem('logged_in_user', JSON.stringify(user));
```

#### **1.3 Response Handling**
```typescript
// src/types/ApiResponse.ts
interface ApiResponse<T> {
  code: number;        // 1 = success, 0 = error
  message: string;
  data: T;
}

// Error handling matching Flutter pattern
if (response.message === 'Unauthenticated') {
  // Auto-logout and redirect to login
}
```

### **Phase 2: Movie Streaming Components (Week 2)**

#### **2.1 Movie Listing Component**
```typescript
// src/components/Movies/MoviesList.tsx
interface MovieFilters {
  title?: string;
  category?: string;
  genre?: string;
  year?: number;
  type?: "Movie" | "Series";
  is_premium?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  per_page?: number;
}

const MoviesList = () => {
  // Implement pagination, filtering, and search
  // Match Flutter app's movie display patterns
}
```

#### **2.2 Video Player Integration**
```typescript
// src/components/Video/VideoPlayer.tsx
const VideoPlayer = ({ movieUrl, movieId }: VideoPlayerProps) => {
  // Use react-player or similar for video playback
  // Implement progress tracking
  // Handle both external URLs and Firebase URLs
  // Save viewing progress to backend
}
```

#### **2.3 Series Management**
```typescript
// src/components/Series/SeriesViewer.tsx
const SeriesViewer = ({ seriesId }: SeriesProps) => {
  // Handle episode navigation
  // Track episode progress
  // Auto-play next episode
}
```

### **Phase 3: Advanced Features (Week 3)**

#### **3.1 Manifest System Implementation**
```typescript
// src/services/ManifestService.ts
class ManifestService {
  // Replicate Flutter's manifest caching pattern
  async getManifest(): Promise<ManifestData> {
    const cached = this.getCachedManifest();
    if (cached) {
      this.updateManifestInBackground();
      return cached;
    }
    return this.fetchManifestOnline();
  }
}
```

#### **3.2 Content Discovery**
```typescript
// src/components/Discovery/
- FeaturedContent.tsx    // Hero section with featured movies
- CategoryBrowser.tsx    // Browse by genre/category  
- SearchResults.tsx      // Advanced search functionality
- RecommendedContent.tsx // Personalized recommendations
```

#### **3.3 User Profile & Progress**
```typescript
// src/components/Profile/
- UserDashboard.tsx      // User profile and settings
- WatchHistory.tsx       // Viewing history
- Watchlist.tsx          // Save for later functionality
- ProgressTracker.tsx    // Resume watching
```

---

## 🔧 **TECHNICAL IMPLEMENTATION DETAILS**

### **HTTP Client Configuration**
```typescript
// src/services/HttpClient.ts
const httpClient = axios.create({
  baseURL: 'http://localhost:8888/katogo/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for auth token
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('logged_in_user_id');
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['logged_in_user_id'] = userId;
  }
  return config;
});

// Response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthenticated - logout user
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### **State Management with Redux Toolkit**
```typescript
// src/store/slices/
- authSlice.ts           // User authentication state
- moviesSlice.ts         // Movies data and filters
- playerSlice.ts         // Video player state
- manifestSlice.ts       // App manifest and config
```

### **Caching Strategy**
```typescript
// src/services/CacheService.ts
// Implement caching similar to Flutter's SharedPreferences pattern
class CacheService {
  // Cache movies data for offline viewing
  // Cache user preferences
  // Cache viewing progress
  // Implement cache expiration policies
}
```

---

## 📱 **KEY FLUTTER PATTERNS TO REPLICATE**

### **1. Offline-First Architecture**
- Cache essential data locally (manifest, user preferences)
- Graceful degradation when offline
- Background sync when connection restored

### **2. Progress Tracking System** 
```typescript
interface ViewProgress {
  movie_id: number;
  user_id: number;
  progress_seconds: number;
  total_seconds: number;
  last_watched_at: string;
}

// Auto-save progress every 10 seconds during playback
const saveProgress = debounce((progress: ViewProgress) => {
  ApiService.saveViewProgress(progress);
}, 10000);
```

### **3. Platform Detection**
```typescript
// Replicate Flutter's platform detection
const getPlatformType = (): 'web' | 'mobile' => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) ? 'mobile' : 'web';
};
```

### **4. Error Handling Pattern**
```typescript
interface ApiError {
  code: number;
  message: string;
  data: null;
}

// Match Flutter's RespondModel pattern
class ResponseHandler {
  static handle<T>(response: any): ApiResponse<T> {
    if (response.message === 'Unauthenticated') {
      AuthService.logout();
      throw new Error('Authentication required');
    }
    
    return {
      code: response.code || 0,
      message: response.message || 'Unknown error',
      data: response.data
    };
  }
}
```

---

## 🎨 **UI/UX ADAPTATION STRATEGY**

### **Component Library Alignment**
- Adapt existing React components to movie streaming context
- Replace e-commerce components with video streaming equivalents:
  - ProductCard → MovieCard
  - ShoppingCart → Watchlist  
  - ProductDetails → MovieDetails
  - CategoryBrowser → GenreBrowser

### **Design System Updates**
```typescript
// src/theme/ugflix.ts
export const ugflixTheme = {
  colors: {
    primary: '#e50914',      // Netflix-like red
    secondary: '#221f1f',    // Dark background
    accent: '#f5f5f1',       // Light text
    surface: '#141414',      // Card backgrounds
  },
  gradients: {
    hero: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4))',
    card: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d30 100%)'
  }
};
```

---

## 🚀 **DEPLOYMENT & PRODUCTION CONSIDERATIONS**

### **Environment Configuration**
```typescript
// Different environments for different stages
export const environments = {
  development: {
    API_BASE_URL: 'http://localhost:8888/katogo/api',
    BASE_URL: 'http://localhost:8888/katogo',
  },
  production: {
    API_BASE_URL: 'https://katogo.schooldynamics.ug/api',  
    BASE_URL: 'https://katogo.schooldynamics.ug',
  }
};
```

### **Performance Optimizations**
1. **Video Streaming**: Implement adaptive bitrate streaming
2. **Image Optimization**: Lazy loading for movie thumbnails  
3. **Code Splitting**: Route-based code splitting
4. **Caching**: Aggressive caching for static content
5. **PWA Features**: Service worker for offline functionality

---

## 📅 **IMPLEMENTATION TIMELINE**

**Week 1: Foundation**
- [x] Project setup and branding updates 
- [ ] API service layer implementation
- [ ] Authentication system
- [ ] Basic routing structure

**Week 2: Core Features**  
- [ ] Movie listing and search
- [ ] Video player integration
- [ ] User profile and progress tracking
- [ ] Manifest system implementation

**Week 3: Advanced Features**
- [ ] Series navigation and management
- [ ] Content discovery and recommendations  
- [ ] Watchlist and favorites
- [ ] Offline functionality

**Week 4: Polish & Production**
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Testing and bug fixes
- [ ] Production deployment

---

## 🎯 **SUCCESS CRITERIA**

✅ **Authentication**: Users can login/register and stay authenticated  
✅ **Content Streaming**: Movies and series play reliably  
✅ **Progress Tracking**: Viewing progress is saved and restored  
✅ **Responsive Design**: Works seamlessly on all devices  
✅ **Performance**: Fast loading and smooth video playback  
✅ **Offline Support**: Essential features work offline  
✅ **API Compatibility**: Full compatibility with existing mobile app

---

## 📞 **NEXT STEPS**

1. **Start with API Service Implementation** - Build the core HTTP service layer
2. **Create Authentication Components** - Login/Register forms with JWT handling
3. **Develop Movie Components** - Movie cards, lists, and detail views
4. **Implement Video Player** - Core streaming functionality
5. **Add Progressive Features** - Search, filters, recommendations

This integration plan ensures the React web app will have feature parity with the Flutter mobile app while leveraging the existing Laravel backend infrastructure efficiently.