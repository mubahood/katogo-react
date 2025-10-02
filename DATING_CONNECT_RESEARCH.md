# Dating/Connect Module - Complete Research & Implementation Plan

## 1. Flutter App Analysis

### 📱 Screens Found
- **UsersListScreen.dart** - Main discovery interface
- **ProfileViewScreen.dart** - User profile viewing
- **ProfileEditScreen.dart** - Profile editing
- **AccountEditPersonalScreen.dart** - Personal info editing
- **AccountEditLifestyleScreen.dart** - Lifestyle preferences
- **AccountEditMainScreen.dart** - Main account settings

### 🎯 Key Features Discovered

#### A. Users List Screen (Connect/Discover)
**View Types:**
1. **List View** - Traditional list with avatars, names, location, occupation, online status
2. **Grid View** - 2-column grid with user cards
3. **Swipe View** - Tinder-style card stack with page controller

**Features:**
- ✅ Real-time search with debounce (500ms)
- ✅ Filters: Online only, Email verified
- ✅ Infinite scroll pagination
- ✅ Pull-to-refresh
- ✅ Online status indicators (green dot)
- ✅ Verified badge (blue checkmark)
- ✅ Direct chat button from list
- ✅ Profile view on tap
- ✅ Shimmer loading states
- ✅ Empty state handling
- ✅ View type toggle (bottom right floating buttons)

**User Card Elements:**
- Avatar with online indicator overlay
- Name/Username
- Occupation
- Location (city, state)
- Online status text
- Verified badge
- Chat button

#### B. Profile View Screen
**Layout:**
- SliverAppBar with expandable user photo (320px height)
- Profile overlay gradient with name and tagline
- Scrollable content with sections

**Information Sections:**

1. **Personal Info Badges** (Horizontal scroll):
   - Age (calculated from DOB)
   - Location (city)
   - Gender (with icon)
   - Online status (green badge)

2. **Bio Section**:
   - Rich text bio
   - Tagline display
   - Empty state messaging

3. **Details Grid** (2 columns):
   - Occupation (work icon)
   - Education level (school icon)
   - Height in cm (height icon)
   - Looking for (favorite icon)
   - Interested in (people icon)
   - Body type (category icon)

4. **Preferences Grid** (2 columns):
   - Smoking habit 🚭
   - Drinking habit 🍷
   - Pet preference 🐾
   - Religion 🙏
   - Political views 🗳️
   - Languages spoken 💬

**Actions**:
- Floating "Send Message" button (bottom right)
- Opens ChatScreen with user context
- Back button to return to list

#### C. Profile Edit Screen
**Form Sections:**

1. **Basic Info**:
   - First name, Last name
   - Email, Phone number (with country code)
   - Sex, Date of Birth
   - Bio, Tagline

2. **Physical Attributes**:
   - Height (cm)
   - Body type
   - Sexual orientation

3. **Location**:
   - Country (picker)
   - State, City
   - Latitude, Longitude

4. **Preferences**:
   - Looking for (relationship type)
   - Interested in (gender preferences)
   - Age range (min/max)
   - Max distance (km)

5. **Lifestyle**:
   - Smoking habit
   - Drinking habit
   - Pet preference

6. **Beliefs & Culture**:
   - Religion
   - Political views
   - Languages spoken

7. **Professional**:
   - Occupation
   - Education level

8. **Profile Photo**:
   - Image picker integration
   - Profile photo upload

**Validation**:
- Required fields: first_name, last_name, sex, email, bio, body_type, occupation
- Country must be selected
- DOB must be at least 14 years old
- Phone number must start with "+"
- All fields synced with backend

### 🔄 User Flow

```
1. Open Connect/Dating Module
   ↓
2. View Users List (default: List view)
   - Switch to Grid or Swipe view
   - Apply filters (Online only, Verified only)
   - Search by name, city, country, username
   ↓
3. Tap on User Card
   ↓
4. View Full Profile
   - See all user details
   - View photo gallery
   - Read bio and preferences
   ↓
5. Take Action:
   a) Send Message → Opens Chat
   b) Go Back → Return to list
   ↓
6. Chat Integration
   - Chat opens with user context
   - Full chat functionality available
   - Can return to profile from chat
```

## 2. Backend API Analysis

### 🔌 API Endpoint

**Main Endpoint**: `GET /api/users-list`

**Location**: `app/Http/Controllers/DynamicCrudController.php` → `users_list()` method

### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `per_page` | int | Items per page (default: 20) |
| `search` | string | Search term (name, city, country, username) |
| `status` | string | User status filter |
| `sex` | string | Gender filter (male/female) |
| `country` | string | Country filter |
| `city` | string | City filter |
| `age_min` | int | Minimum age |
| `age_max` | int | Maximum age |
| `online_only` | string | "yes" for online users only |
| `email_verified` | string | "yes" for verified users only |
| `sort_by` | string | Sort field (default: last_online_at) |
| `sort_dir` | string | Sort direction (asc/desc, default: desc) |
| `last_update_date` | datetime | Incremental sync timestamp |
| `fields` | string | Comma-separated field list (optional) |

### Response Structure

```typescript
{
  code: 1,
  message: "Users retrieved successfully.",
  data: {
    current_page: number,
    data: User[],
    first_page_url: string,
    from: number,
    last_page: number,
    last_page_url: string,
    links: Array<{url: string | null, label: string, active: boolean}>,
    next_page_url: string | null,
    path: string,
    per_page: number,
    prev_page_url: string | null,
    to: number,
    total: number
  }
}
```

### User Object Fields (from admin_users table)

```typescript
interface ConnectUser {
  // Core Identity
  id: number;
  username: string;
  name: string;
  email: string;
  avatar: string;
  
  // Personal Info
  first_name: string;
  last_name: string;
  phone_number: string;
  phone_number_2: string;
  sex: string; // "male", "female"
  dob: string; // YYYY-MM-DD
  
  // Profile Content
  bio: string;
  tagline: string;
  profile_photos: string; // JSON array
  
  // Physical Attributes
  height_cm: string;
  body_type: string;
  sexual_orientation: string;
  
  // Location
  country: string;
  state: string;
  city: string;
  latitude: string;
  longitude: string;
  address: string;
  
  // Phone Details
  phone_country_name: string;
  phone_country_code: string;
  phone_country_international: string;
  
  // Dating Preferences
  looking_for: string; // Relationship type
  interested_in: string; // Gender preferences
  age_range_min: string;
  age_range_max: string;
  max_distance_km: string;
  
  // Lifestyle
  smoking_habit: string;
  drinking_habit: string;
  pet_preference: string;
  
  // Beliefs & Culture
  religion: string;
  political_views: string;
  languages_spoken: string;
  
  // Professional
  education_level: string;
  occupation: string;
  
  // Verification & Status
  email_verified: string; // "yes"/"no"
  phone_verified: string; // "yes"/"no"
  verification_code: string;
  status: string;
  
  // Online Presence
  last_online_at: string; // timestamp
  online_status: string; // "online", "offline", "2 hours ago", etc.
  
  // Subscription & Credits
  subscription_tier: string;
  subscription_expires: string;
  credits_balance: string;
  
  // Engagement Metrics
  profile_views: string;
  likes_received: string;
  matches_count: string;
  completed_profile_pct: string;
  
  // Security
  failed_login_attempts: string;
  last_password_change: string;
  secret_code: string;
  
  // System Fields
  company_id: string;
  remember_token: string;
  created_at: string;
  updated_at: string;
}
```

### Backend Logic Flow

1. **Authentication Check**: Requires valid JWT token
2. **User Activity Update**: Updates `last_online_at` timestamp
3. **Query Building**:
   - Base query on `admin_users` table
   - Apply incremental sync filter if `last_update_date` provided
   - Apply full-text search on name, city, country, username
   - Apply exact filters: status, sex, country, city
   - Calculate age range from DOB if age filters provided
   - Sort by specified field (default: last_online_at DESC)
4. **Pagination**: Laravel pagination with customizable per_page
5. **Response**: Structured JSON with pagination metadata

### Related Endpoints (Already Existing)

```typescript
// Chat Integration
POST /api/chat-start
POST /api/chat-send
GET /api/chat-messages
GET /api/chat-heads
POST /api/chat-mark-as-read
POST /api/chat-delete

// User Blocking & Reporting
POST /api/moderation/block-user
POST /api/moderation/unblock-user
GET /api/moderation/blocked-users
POST /api/moderation/report-content

// Profile Management
POST /api/dynamic-save (for profile updates)
GET /api/me (get current user profile)
```

## 3. React Implementation Architecture

### 📁 File Structure

```
src/app/
├── pages/
│   └── connect/
│       ├── ConnectLayout.tsx                 # Main layout wrapper
│       ├── ConnectDiscover.tsx              # Main discovery page
│       ├── ConnectProfile.tsx               # User profile view
│       ├── ConnectSettings.tsx              # User's own profile edit
│       ├── ConnectMatches.tsx               # Matches/Likes page
│       └── components/
│           ├── UserCard.tsx                 # User card component
│           ├── UserCardGrid.tsx             # Grid layout
│           ├── UserCardList.tsx             # List layout
│           ├── UserCardSwipe.tsx            # Swipe layout
│           ├── FilterSidebar.tsx            # Filters panel
│           ├── ProfileSection.tsx           # Profile sections
│           ├── SwipeControls.tsx            # Like/Pass buttons
│           ├── OnlineIndicator.tsx          # Online status badge
│           └── VerifiedBadge.tsx            # Verified badge
├── services/
│   └── ConnectApiService.ts                 # API service
├── models/
│   └── ConnectModels.ts                     # TypeScript interfaces
└── styles/
    └── connect/
        ├── ConnectDiscover.css
        ├── UserCard.css
        └── SwipeAnimations.css
```

### 🎨 Component Design

#### 1. ConnectLayout
```typescript
<ConnectLayout>
  <ConnectHeader /> {/* Title, Search, View Toggle */}
  <ConnectSidebar /> {/* Filters */}
  <Outlet /> {/* Nested routes */}
</ConnectLayout>
```

#### 2. ConnectDiscover (Main Page)
```typescript
<ConnectDiscover>
  <ViewTypeSelector /> {/* Cards, Grid, List */}
  <FilterButton /> {/* Mobile filter toggle */}
  <SearchBar />
  
  {/* Dynamic view based on viewType */}
  {viewType === 'cards' && <UserCardSwipe users={users} />}
  {viewType === 'grid' && <UserCardGrid users={users} />}
  {viewType === 'list' && <UserCardList users={users} />}
  
  <InfiniteScroll onLoadMore={loadMore} />
  <LoadingState />
  <EmptyState />
</ConnectDiscover>
```

#### 3. UserCardSwipe (Tinder-style)
```typescript
<AnimatePresence>
  {users.map((user, index) => (
    <motion.div
      key={user.id}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{
        scale: index === 0 ? 1 : 0.95,
        y: index * 10,
        zIndex: users.length - index
      }}
    >
      <UserCard user={user} size="large" />
    </motion.div>
  ))}
</AnimatePresence>

<SwipeControls>
  <Button onClick={handlePass}>❌</Button>
  <Button onClick={handleLike}>❤️</Button>
</SwipeControls>
```

#### 4. ConnectProfile (Profile View)
```typescript
<ConnectProfile userId={userId}>
  <ProfileHeader>
    <HeroImage src={user.avatar} />
    <ProfileOverlay>
      <h1>{user.name}</h1>
      <p>{user.tagline}</p>
    </ProfileOverlay>
  </ProfileHeader>
  
  <PersonalInfoBadges>
    <Badge icon="🎂">{age} Years</Badge>
    <Badge icon="📍">{user.city}</Badge>
    <Badge icon="⚥">{user.sex}</Badge>
    {user.isOnline && <OnlineBadge />}
  </PersonalInfoBadges>
  
  <BioSection bio={user.bio} />
  
  <DetailsGrid>
    <DetailItem icon={<FiWork />} value={user.occupation} />
    <DetailItem icon={<FiBook />} value={user.education_level} />
    {/* ... more details */}
  </DetailsGrid>
  
  <PreferencesGrid>
    <PreferenceItem title="🚭 Smoking" value={user.smoking_habit} />
    {/* ... more preferences */}
  </PreferencesGrid>
  
  <ActionButtons>
    <Button onClick={startChat}>💬 Send Message</Button>
    <IconButton onClick={report}>🚩</IconButton>
    <IconButton onClick={block}>🚫</IconButton>
  </ActionButtons>
</ConnectProfile>
```

### 🔌 API Service Design

```typescript
// src/app/services/ConnectApiService.ts

export class ConnectApiService {
  private static baseUrl = '/api';
  
  // Get users list with filters
  static async getUsersList(
    filters: ConnectFilters,
    page: number = 1,
    perPage: number = 20
  ): Promise<ConnectUsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...filters
    });
    
    const response = await ApiService.get(`${this.baseUrl}/users-list?${params}`);
    return {
      users: response.data.data.map(user => this.mapToConnectUser(user)),
      pagination: {
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
        perPage: response.data.per_page,
        hasMore: response.data.next_page_url !== null
      }
    };
  }
  
  // Get single user profile
  static async getUserProfile(userId: number): Promise<ConnectUser> {
    const response = await ApiService.get(`${this.baseUrl}/dynamic-list`, {
      model: 'User',
      id: userId
    });
    return this.mapToConnectUser(response.data);
  }
  
  // Update own profile
  static async updateMyProfile(data: Partial<ConnectUser>): Promise<void> {
    await ApiService.post(`${this.baseUrl}/dynamic-save`, {
      model: 'User',
      ...data
    });
  }
  
  // Start chat with user
  static async startChat(userId: number): Promise<{ chatId: number }> {
    const response = await ApiService.post(`${this.baseUrl}/chat-start`, {
      receiver_id: userId
    });
    return { chatId: response.data.id };
  }
  
  // Block user
  static async blockUser(userId: number, reason?: string): Promise<void> {
    await ApiService.post(`${this.baseUrl}/moderation/block-user`, {
      blocked_user_id: userId,
      reason
    });
  }
  
  // Report user
  static async reportUser(
    userId: number,
    reason: string,
    details?: string
  ): Promise<void> {
    await ApiService.post(`${this.baseUrl}/moderation/report-content`, {
      content_type: 'user',
      content_id: userId,
      reason,
      details
    });
  }
  
  // Helper to map backend user to frontend model
  private static mapToConnectUser(data: any): ConnectUser {
    return {
      ...data,
      age: this.calculateAge(data.dob),
      isOnline: this.checkOnlineStatus(data.online_status),
      isVerified: data.email_verified === 'yes',
      profilePhotos: this.parseProfilePhotos(data.profile_photos)
    };
  }
  
  private static calculateAge(dob: string): number {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  
  private static checkOnlineStatus(status: string): boolean {
    return status?.toLowerCase() === 'online';
  }
  
  private static parseProfilePhotos(photos: string): string[] {
    try {
      return photos ? JSON.parse(photos) : [];
    } catch {
      return [];
    }
  }
}
```

### 🎯 Unique Features to Implement

1. **Smooth Swipe Animations**:
   - Framer Motion drag gestures
   - Card rotation on swipe
   - Like/Pass visual feedback
   - Smooth card stack effect
   - Undo last swipe

2. **Advanced Filters**:
   - Age range slider
   - Distance radius slider
   - Multiple body type selection
   - Interest tags
   - Save filter presets

3. **Real-time Features**:
   - Online status (WebSocket/polling)
   - Typing indicators
   - New message notifications
   - Profile view tracking
   - Live match notifications

4. **Enhanced Profile View**:
   - Photo gallery with lightbox
   - Swipeable photo carousel
   - Profile completeness indicator
   - Mutual interests highlighting
   - Compatibility score (future)

5. **Smart Search**:
   - Debounced search
   - Search history
   - Recent searches
   - Suggested searches

6. **Accessibility**:
   - Keyboard navigation for swipe
   - Screen reader support
   - Focus management
   - ARIA labels

## 4. Implementation Phases

### Phase 1: Foundation (Complete this first)
- ✅ Create folder structure
- ✅ Define TypeScript interfaces
- ✅ Build ConnectApiService
- ✅ Add routes to AppRoutes
- ✅ Create ConnectLayout

### Phase 2: Core UI (Build these next)
- ✅ ConnectDiscover page
- ✅ UserCard components (all 3 variants)
- ✅ FilterSidebar
- ✅ Basic CSS styles
- ✅ Loading/Empty states

### Phase 3: Swipe Feature (Most complex)
- ✅ UserCardSwipe with framer-motion
- ✅ Drag gestures
- ✅ Swipe animations
- ✅ Like/Pass actions
- ✅ Undo functionality

### Phase 4: Profile View
- ✅ ConnectProfile component
- ✅ Profile sections
- ✅ Action buttons
- ✅ Chat integration
- ✅ Report/Block functionality

### Phase 5: Settings & Polish
- ✅ ConnectSettings (profile edit)
- ✅ ConnectMatches page
- ✅ Mobile responsive design
- ✅ Performance optimization
- ✅ Testing & bug fixes

## 5. Design System Consistency

### Colors (Match existing theme)
- Primary: `#FFD700` (Yellow)
- Accent: `#FFFFFF` (White)
- Background: `#000000` (Black)
- Card: `#1A1A1A` (Dark Gray)
- Border: `#333333`

### Typography
- Use existing Montserrat font
- Match existing font sizes and weights
- Consistent heading hierarchy

### Components
- Reuse existing button styles
- Match existing card designs
- Consistent spacing system
- Use existing icons (Feather Icons)

### Animations
- Match existing page transitions
- Consistent hover effects
- Smooth state changes
- Framer Motion for advanced animations

## 6. Chat Integration Points

### From Connect to Chat
```typescript
// UserCard - Chat button
<IconButton onClick={() => startChat(user.id)}>
  <FiMessageCircle />
</IconButton>

// ProfileView - Send Message button
<Button onClick={() => startChat(user.id)}>
  <FiMessageCircle /> Send Message
</Button>

// ConnectMatches - Message button
<Button onClick={() => openChat(match.chatId)}>
  View Chat
</Button>
```

### Shared User Context
```typescript
interface ChatUserContext {
  userId: number;
  userName: string;
  userAvatar: string;
  profileLink: string; // Link back to Connect profile
}
```

## 7. Next Steps

1. ✅ **Create TypeScript Models** → Start here
2. ✅ **Build ConnectApiService** → Core functionality
3. ✅ **Setup Routes & Layout** → Navigation structure
4. ✅ **Build ConnectDiscover** → Main page
5. ✅ **Implement Swipe Feature** → Unique feature
6. ✅ **Build Profile View** → Detail page
7. ✅ **Integrate Chat** → Connect features
8. ✅ **Add to Navigation** → Menu integration
9. ✅ **Polish & Test** → Final refinement

---

**Research Complete**: Ready to implement! 🚀
