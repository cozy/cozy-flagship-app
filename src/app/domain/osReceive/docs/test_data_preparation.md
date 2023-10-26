## Mobile Cloud File Upload - Test Scenarios & Test Data Preparation

### Test Data Preparation:

#### Creating Dummy Files on Android Emulator:
To test the upload functionality with larger files, you can generate dummy files of specific sizes directly on the Android emulator.

**Steps**:
1. Connect to the emulator using ADB shell:
   ```bash
   adb shell
   ```

2. Navigate to the desired test directory, e.g., `/sdcard/fixtures`:
   ```bash
   mkdir -p /sdcard/fixtures && cd /sdcard/fixtures
   ```

3. Create test data

**Create a dummy file with accurate values:**
   ```bash
   dd if=/dev/zero of=foo.bar bs=1M count=100
   ```

   - `if=/dev/zero`: Source of input bytes (stream of zero bytes).
   - `of=foo.bar`: Name of the output file.
   - `bs=1M`: Sets block size to 1 megabyte.
   - `count=100`: Copies 100 blocks, thus resulting in a 100MB file.


**Create 10 random files:**
  ```bash
  for i in $(seq 1 10); do
    # Random size between 1MB to 100MB
    SIZE=$(( ( RANDOM % 100 )  + 1 ))
    
    # Generate random file names with a variety of extensions
    EXTENSIONS=("txt" "jpg" "png" "mp4" "pdf")
    RAND_EXT=${EXTENSIONS[$RANDOM % ${#EXTENSIONS[@]} ]}
    FILENAME="randomfile_$i.$RAND_EXT"

    # Create the file using dd
    dd if=/dev/zero of=$FILENAME bs=1M count=$SIZE
  done
  ```