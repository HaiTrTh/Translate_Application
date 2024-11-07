document.getElementById("submitBtn").addEventListener("click", () => {
  const chineseText = document.getElementById("chineseText").value;
  if (chineseText) {
      // Gửi yêu cầu đến backend để lấy ảnh từ API
      fetch(`/fetchImage?text=${encodeURIComponent(chineseText)}`)
          .then(response => response.json())
          .then(data => {
              if (data.imageUrl) {
                  document.getElementById("displayedImage").src = data.imageUrl;
              } else {
                  alert("Không tìm thấy ảnh.");
              }
          })
          .catch(error => {
              console.error("Error fetching image:", error);
              alert("Không thể lấy ảnh.");
          });
  } else {
      alert("Vui lòng nhập văn bản Trung Quốc.");
  }

//   if (chineseText) {
//     // Gửi yêu cầu tới backend để lấy audio
//     fetch(`/fetchAudio?text=${encodeURIComponent(chineseText)}`)
//         .then(response => response.json())
//         .then(data => {
//             const audioUrl = data.audioUrl;  // Lấy URL âm thanh từ response
//             const audioPlayer = document.getElementById("audioPlayer");
//             audioPlayer.src = audioUrl;  // Cập nhật nguồn âm thanh
//             audioPlayer.load();  // Nạp lại âm thanh
//             audioPlayer.play();  // Phát âm thanh
//         })
//         .catch(error => {
//             console.error("Error fetching audio:", error);
//             alert("Không thể tạo âm thanh.");
//         });
//     } else {
//         alert("Vui lòng nhập văn bản.");
//     }

    if (chineseText) {
        // Fetch audio from backend
        fetch(`/fetchAudio?text=${encodeURIComponent(chineseText)}`)
            .then(response => response.blob()) // Expect a blob response for audio
            .then(blob => {
                const audioUrl = URL.createObjectURL(blob); // Create an object URL from the blob
                const audioPlayer = document.getElementById("audioPlayer");
                audioPlayer.src = audioUrl; // Update the audio source
                audioPlayer.load(); // Load the new audio source
                audioPlayer.play(); // Play the audio
            })
            .catch(error => {
                console.error("Error fetching audio:", error);
                alert("Không thể tạo âm thanh.");
            });
        } else {
        alert("Vui lòng nhập văn bản.");
    }
});
