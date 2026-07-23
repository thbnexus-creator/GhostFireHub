# GHOSTFIREHUB 2.0 - NATIVE ANDROID MIGRATION SPECIFICATION & BLUEPRINT
**Version:** 2.0.0-PROD
**Target Architecture:** Android Native (Kotlin + Jetpack Compose + Hilt / Coroutines / Flow + Firebase SDK)

---

## 1. Executive Summary & Mapping Overview

This specification maps the feature-complete GhostFireHub Web codebase into the target native Android architecture. Every web TypeScript/React component, GhostCore math calculation engine, and Firestore repository function maps 1:1 into a dedicated Android Kotlin package structure.

---

## 2. Target Kotlin Package Structure

```
com.ghostfirehub.app/
├── authentication/
│   ├── AuthRepository.kt
│   ├── AuthViewModel.kt
│   └── ui/
│       ├── LoginScreen.kt
│       ├── RegisterScreen.kt
│       └── PasswordResetDialog.kt
├── ghostcore/
│   ├── SensitivityGeneratorEngine.kt
│   ├── HardwareEvaluatorEngine.kt
│   ├── HudCalculatorsEngine.kt
│   ├── RecommendationEngine.kt
│   └── AiExplanationGeneratorEngine.kt
├── repository/
│   ├── UserProfileRepository.kt
│   ├── MarketplaceRepository.kt
│   ├── DeviceRepository.kt
│   ├── WeaponRepository.kt
│   ├── CommunityRepository.kt
│   ├── HudLayoutRepository.kt
│   ├── PresetRepository.kt
│   └── AdminRepository.kt
├── firebase/
│   ├── FirebaseFirestoreService.kt
│   ├── FirebaseAuthService.kt
│   ├── FirebaseStorageService.kt
│   └── FirestoreCollections.kt
├── community/
│   ├── CommunityViewModel.kt
│   ├── ui/
│   │   ├── CommunityFeedScreen.kt
│   │   ├── GiveawaysScreen.kt
│   │   ├── LeaderboardScreen.kt
│   │   └── PostDetailDialog.kt
├── marketplace/
│   ├── MarketplaceViewModel.kt
│   ├── ui/
│   │   ├── MarketplaceGridScreen.kt
│   │   ├── ProductDetailScreen.kt
│   │   └── VendorDashboardScreen.kt
├── devices/
│   ├── DeviceDbViewModel.kt
│   ├── ui/
│   │   ├── DeviceCatalogScreen.kt
│   │   ├── DeviceComparisonScreen.kt
│   │   └── AddDeviceDialog.kt
├── weapons/
│   ├── WeaponsDbViewModel.kt
│   ├── ui/
│   │   ├── WeaponCatalogScreen.kt
│   │   └── WeaponDetailScreen.kt
├── admin/
│   ├── AdminViewModel.kt
│   ├── ui/
│   │   ├── AdminDashboardScreen.kt
│   │   ├── UserManagementScreen.kt
│   │   ├── VendorApprovalScreen.kt
│   │   ├── ContentModerationScreen.kt
│   │   └── SystemConfigScreen.kt
├── profile/
│   ├── ProfileViewModel.kt
│   ├── ui/
│   │   ├── ProfileScreen.kt
│   │   ├── EditProfileDialog.kt
│   │   └── SharedProfileViewScreen.kt
├── generator/
│   ├── CalibrationViewModel.kt
│   ├── ui/
│   │   ├── SensitivityGeneratorScreen.kt
│   │   ├── HudCanvasEditorScreen.kt
│   │   └── PerformanceHeatmapScreen.kt
├── settings/
│   ├── SettingsViewModel.kt
│   └── ui/
│       ├── AppSettingsScreen.kt
│       └── ThemeSelectorScreen.kt
├── notifications/
│   ├── NotificationManagerService.kt
│   └── ui/
│       └── NotificationTrayScreen.kt
├── theme/
│   ├── Theme.kt
│   ├── Color.kt
│   ├── Type.kt
│   └── Presets.kt
├── models/
│   ├── UserProfile.kt
│   ├── Device.kt
│   ├── Weapon.kt
│   ├── MarketplaceProduct.kt
│   ├── CommunityPost.kt
│   ├── SensitivityProfile.kt
│   └── HudLayout.kt
├── navigation/
│   ├── AppNavigation.kt
│   └── Screen.kt
├── storage/
│   ├── LocalDataStore.kt
│   └── PreferencesManager.kt
└── utils/
    ├── CurrencyFormatter.kt
    ├── DisplayNameFormatter.kt
    └── ImageLoaderUtils.kt
```

---

## 3. Web-to-Android Component Mapping Matrix

| Web React Component / Module | Target Android Kotlin Class / Screen | Package |
| :--- | :--- | :--- |
| `/src/ghostcore/sensitivityGenerator.ts` | `SensitivityGeneratorEngine.kt` | `ghostcore` |
| `/src/ghostcore/hardwareEvaluator.ts` | `HardwareEvaluatorEngine.kt` | `ghostcore` |
| `/src/ghostcore/hudCalculators.ts` | `HudCalculatorsEngine.kt` | `ghostcore` |
| `/src/ghostcore/recommendationEngine.ts` | `RecommendationEngine.kt` | `ghostcore` |
| `/src/ghostcore/aiExplanationGenerator.ts` | `AiExplanationGeneratorEngine.kt` | `ghostcore` |
| `/src/lib/dbService.ts` | `RepositoryImpl.kt` (Hilt Singletons) | `repository` |
| `/src/components/AdminWorkspace.tsx` | `AdminDashboardScreen.kt` | `admin.ui` |
| `/src/components/AuthScreens.tsx` | `LoginScreen.kt` / `RegisterScreen.kt` | `authentication.ui` |
| `/src/components/CommunitySection.tsx` | `CommunityFeedScreen.kt` | `community.ui` |
| `/src/components/CommunityGiveaways.tsx` | `GiveawaysScreen.kt` | `community.ui` |
| `/src/components/DashboardView.tsx` | `ProfileScreen.kt` / `AppSettingsScreen.kt` | `profile.ui` / `settings.ui` |
| `/src/components/DeviceDB.tsx` | `DeviceCatalogScreen.kt` | `devices.ui` |
| `/src/components/GenerateWorkspace.tsx` | `SensitivityGeneratorScreen.kt` | `generator.ui` |
| `/src/components/HUDCanvas.tsx` | `HudCanvasEditorScreen.kt` | `generator.ui` |
| `/src/components/MarketplaceView.tsx` | `MarketplaceGridScreen.kt` | `marketplace.ui` |
| `/src/components/PerformanceHeatMap.tsx` | `PerformanceHeatmapScreen.kt` | `generator.ui` |
| `/src/components/RecommendationEngine.tsx` | `CalibrationViewModel.kt` | `generator` |
| `/src/components/VendorDashboard.tsx` | `VendorDashboardScreen.kt` | `marketplace.ui` |
| `/src/components/WeaponsDB.tsx` | `WeaponCatalogScreen.kt` | `weapons.ui` |
| `/src/components/UniversalSearchModal.tsx` | `UniversalSearchDialog.kt` | `navigation` |
| `/src/components/common/OptimizedImage.tsx` | Coil `AsyncImage` with SubcomposeAsyncImage | `utils` |
| `/src/components/common/Skeleton.tsx` | Compose Shimmer Brush Modifier | `utils` |
| `/src/components/common/EmptyState.tsx` | `EmptyStateComponent.kt` | `utils` |

---

## 4. Key Architectural Rules for Android Migration

1. **State Management**: Flow and StateFlow inside Jetpack Compose ViewModels.
2. **Database Engine**: Official Firebase Android SDK with Offline Persistence enabled (`FirebaseFirestoreSettings.Builder().setLocalCacheSettings(...)`).
3. **GhostCore Math**: Pure Kotlin object singletons with zero Android UI dependencies for fast unit testing.
4. **Theme Dynamic Ingestion**: Jetpack Compose `MaterialTheme` with custom `ColorScheme` mapped from `--theme-primary` and `--theme-secondary`.
