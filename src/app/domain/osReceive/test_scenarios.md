## Receiving files from mobile OS - Test Scenarios

### Happy Path Scenarios:

#### 1. Single fFile Upload:
- **Objective**: Ensure a user can select a file from their device, use the share feature to select the Cozy App, and successfully upload the file.
- **Steps**:
  1. Open a file browsing app or gallery on the mobile device.
  2. Select a valid file.
  3. Click on the share icon.
  4. Choose the Cozy App from the share menu.
  5. Wait for the upload to complete in Cozy Drive.
- **Expected Outcome**: File should be successfully uploaded to Cozy Drive and the user should receive a confirmation notification or feedback

#### 2. Multiple Files Upload:
- **Objective**: Ensure a user can select and upload multiple files at once to the Cozy App.
- **Steps**:
  1. Open a file browsing app or gallery on the mobile device.
  2. Select multiple valid files.
  3. Click on the share icon.
  4. Choose the Cozy App from the share menu.
  5. Wait for all uploads to complete.
- **Expected Outcome**: All selected files should be successfully uploaded to the Cozy Drive and the user should receive a confirmation notification or feedback.

#### 4. Sharing a File with App Already Open:
- **Objective**: Ensure a user can upload a file to the Cozy App using the share feature while the app is already open.
- **Steps**:
  1. Open the Cozy App.
  2. Navigate to another app or file browser and select a valid file.
  3. Use the share feature and choose the Cozy App from the share menu.
  4. Observe the behavior in the Cozy App.
- **Expected Outcome**: The Cozy App should smoothly handle the file, upload it successfully, and provide a confirmation feedback without any crashes or unexpected behaviors.

#### 5. Multiple Uploads in a Single App Session:
- **Objective**: Verify that the user can perform multiple file uploads in a single app session without issues.
- **Steps**:
  1. Open the Cozy App.
  2. Navigate to a file browser and select a valid file.
  3. Use the share feature to upload to the Cozy App.
  4. After a successful upload, put the app in the background without closing it.
  5. Repeat steps 2 and 3 with a different file.
  6. Return to the Cozy App to confirm the presence of both files.
- **Expected Outcome**: Multiple files are successfully uploaded to the Cozy Drive during a single session and are visible in the app without any glitches.
