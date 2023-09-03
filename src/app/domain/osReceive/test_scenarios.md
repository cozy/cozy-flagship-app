## Receiving files from mobile OS - Test Scenarios

### Happy Path Scenarios:

#### 1. Basic Upload:
- **Objective**: Ensure a user can select a file from their device, use the share feature to select the cloud application, and successfully upload the file.
- **Steps**:
  1. Open a file browsing app or gallery on the mobile device.
  2. Select a valid file.
  3. Click on the share icon.
  4. Choose the cloud application from the share menu.
  5. Wait for the upload to complete.
- **Expected Outcome**: File should be successfully uploaded to the cloud application and the user should receive a confirmation notification or feedback.

#### 2. Notification/Feedback:
- **Objective**: Ensure that the user receives feedback upon a successful upload.
- **Steps**:
  1. Follow the steps from the "Basic Upload" scenario.
  2. Observe any notifications or feedback provided by the cloud application.
- **Expected Outcome**: A notification or some form of feedback is presented to the user, confirming the successful upload.

#### 3. Multiple Files Upload:
- **Objective**: Ensure a user can select and upload multiple files at once to the cloud application.
- **Steps**:
  1. Open a file browsing app or gallery on the mobile device.
  2. Select multiple valid files.
  3. Click on the share icon.
  4. Choose the cloud application from the share menu.
  5. Wait for all uploads to complete.
- **Expected Outcome**: All selected files should be successfully uploaded to the cloud application and the user should receive a confirmation notification or feedback.

#### 4. Sharing a File with App Already Open:
- **Objective**: Ensure a user can upload a file to the cloud application using the share feature while the app is already open.
- **Steps**:
  1. Open the cloud application.
  2. Navigate to another app or file browser and select a valid file.
  3. Use the share feature and choose the cloud application from the share menu.
  4. Observe the behavior in the cloud application.
- **Expected Outcome**: The cloud application should smoothly handle the file, upload it successfully, and provide a confirmation feedback without any crashes or unexpected behaviors.

#### 5. Multiple Uploads in a Single App Session:
- **Objective**: Verify that the user can perform multiple file uploads in a single app session without issues.
- **Steps**:
  1. Open the cloud application.
  2. Navigate to a file browser and select a valid file.
  3. Use the share feature to upload to the cloud application.
  4. After a successful upload, put the app in the background without closing it.
  5. Repeat steps 2 and 3 with a different file.
  6. Return to the cloud application to confirm the presence of both files.
- **Expected Outcome**: Multiple files are successfully uploaded to the cloud application during a single session and are visible in the app without any glitches.

#### 6. App State Retention After Wake-Up:
- **Objective**: Ensure that the cloud application maintains a consistent state after being put in the background and woken up, especially regarding file uploads.
- **Steps**:
  1. Open the cloud application.
  2. Navigate to a file browser, select a valid file, and share it with the cloud application.
  3. Before the upload completes, put the app in the background.
  4. After a short duration (1-2 minutes), return to the cloud application.
  5. Check the status of the previous file upload.
  6. Repeat file upload process with another file.
- **Expected Outcome**: On returning to the app, the user should see the previously shared file uploaded successfully. The second file should also be uploaded without any hitches, showcasing that state management is intact and functioning properly.