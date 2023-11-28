import BackgroundGeolocation from 'react-native-background-geolocation'

/**
 * Motion activities
 */
export const STILL_ACTIVITY = 'still'

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
export const LARGE_TEMPORAL_DELTA = 30 * 60 // In seconds. Shouldn't have longer breaks without siginificant motion
export const MAX_TEMPORAL_DELTA = 12 * 60 * 60 // In seconds. See https://github.com/e-mission/e-mission-server/blob/f6bf89a274e6cd10353da8f17ebb327a998c788a/emission/analysis/intake/segmentation/trip_segmentation_methods/dwell_segmentation_dist_filter.py#L194
export const MIN_SPEED_BETWEEN_DISTANT_POINTS = 0.1 // In m/s. Note the average walking speed is ~1.4 m/s
export const MAX_DOCS_PER_BATCH = 30000 // Should be less than 10 MB. Should never reach 15 MB.

/**
 * Trace server
 */
export const SERVER_URL = 'https://openpath.cozycloud.cc'
