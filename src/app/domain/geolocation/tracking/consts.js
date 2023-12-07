import BackgroundGeolocation from 'react-native-background-geolocation'

/**
 * Motion activities
 */
export const STILL_ACTIVITY = 'still'
export const WALKING_ACTIVITY = 'walking'

/**
 * Tracking plugin config
 */
export const DISTANCE_FILTER = 10
export const ELASTICITY_MULTIPLIER = 4
export const ACCURACY = BackgroundGeolocation.DESIRED_ACCURACY_HIGH
export const DEFAULT_TRACKING_CONFIG = {
  distanceFilter: DISTANCE_FILTER,
  elasticityMultiplier: ELASTICITY_MULTIPLIER,
  desiredAccuracy: ACCURACY
}
// Align with openpath: https://github.com/e-mission/e-mission-server/blob/master/emission/analysis/intake/segmentation/trip_segmentation.py#L59
export const WAIT_BEFORE_STOP_MOTION_EVENT = 10 // In minutes

/**
 * Tracking processing
 */
export const LOW_CONFIDENCE_THRESHOLD = 0.5 // Threshold for low activity confidence
export const LARGE_TEMPORAL_DELTA = 30 * 60 // 30min, in seconds. Shouldn't have longer breaks without siginificant motion
export const MAX_TEMPORAL_DELTA = 12 * 60 * 60 // 18h, in seconds. See https://github.com/e-mission/e-mission-server/blob/f6bf89a274e6cd10353da8f17ebb327a998c788a/emission/analysis/intake/segmentation/trip_segmentation_methods/dwell_segmentation_dist_filter.py#L194
export const MIN_SPEED_BETWEEN_DISTANT_POINTS = 0.1 // In m/s. Note the average walking speed is ~1.4 m/s
export const MAX_DOCS_PER_BATCH = 30000 // Should be less than 10 MB. Should never reach 15 MB.
export const WALKING_SPEED_AVG = 1.34 // In m/s
export const MIN_DISTANCE_TO_USE_LAST_POINT = 50 // In meters.
export const MAX_DISTANCE_TO_USE_LAST_POINT = 6000 // In meters. This value is quite high, but we noticed on iOS + Android that it can take this far to wake up when network data is disabled

export const AVG_WALKING_SPEED = 1.34
/**
 * Trace server
 */
export const SERVER_URL = 'https://openpath.cozycloud.cc'
