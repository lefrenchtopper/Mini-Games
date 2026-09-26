import requests

# Your temporary video link
video_url = "https://d305369.fpvcdn.com/key=tXe1lfNTtw8PFnLQiMi0lg,end=1789908649,ip=2401:4900:926c:4f2c:c42:3721:25b6:496d,country=IN,speed=1.5,buffer=0,reftag=/disk0/1619000/1619138/1619138_720.mp4"
output_file = "my_video.mp4"

print("Connecting to server and starting download...")

try:
    # Send request with a standard browser User-Agent header to avoid blocks
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    response = requests.get(video_url, headers=headers, stream=True)
    response.raise_for_status()  # This will trigger an error if the link has expired

    # Write the file in 1MB chunks to track progress
    with open(output_file, "wb") as file:
        for chunk in response.iter_content(chunk_size=1024 * 1024):
            if chunk:
                file.write(chunk)
                print(".", end="", flush=True)  # Prints a dot for every MB downloaded

    print("\nDownload finished successfully! Saved as:", output_file)

except requests.exceptions.HTTPError as e:
    print(f"\nFailed to download. The link may have expired or blocked access: {e}")
except requests.exceptions.ConnectionError:
    print("\nNetwork error. Please check your internet connection and try again.")
