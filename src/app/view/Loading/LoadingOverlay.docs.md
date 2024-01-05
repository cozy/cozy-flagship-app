## `useLoadingOverlay` Hook Documentation

### Overview
The `useLoadingOverlay` hook provides a simple and flexible way to manage a loading overlay in the application. It allows you to show or hide an overlay with a customizable message, ideal for indicating loading states during asynchronous operations like API calls or data processing.


### Using the hook

   Import and use the `useLoadingOverlay` hook in your components to control the overlay.

   ```typescript
   import { useLoadingOverlay } from 'app/view/Loading/LoadingOverlay';

   const MyComponent = () => {
       const { showOverlay, hideOverlay } = useLoadingOverlay();

       // Use showOverlay and hideOverlay as needed
   };
   ```

### API

#### `showOverlay(message?: string): void`
- **Description**: Shows the loading overlay with an optional message.
- **Parameters**:
  - `message`: *(Optional)* The message to display on the overlay.
- **Example**:
  ```typescript
  showOverlay('Loading data...');
  ```

#### `hideOverlay(): void`
- **Description**: Hides the loading overlay.
- **Example**:
  ```typescript
  hideOverlay();
  ```

### Best Practices

- **Explicit Control**: Always ensure to hide the overlay explicitly once the loading process is complete.
- **Error Handling**: In case of asynchronous operations, use `hideOverlay` in both `.then()` and `.catch()` to handle successful and error scenarios.
- **Cleanup**: For operations tied to the component lifecycle, use the `useEffect` cleanup function to hide the overlay.

### Example Usage

```typescript
const FileDownloader = () => {
    const { showOverlay, hideOverlay } = useLoadingOverlay();

    const downloadFiles = async () => {
        showOverlay('Downloading files...');
        try {
            await downloadFileLogic();
        } catch (error) {
            console.error(error);
            // Handle error
        } finally {
            hideOverlay();
        }
    };

    return (
        <button onClick={downloadFiles}>Download</button>
    );
};
```
