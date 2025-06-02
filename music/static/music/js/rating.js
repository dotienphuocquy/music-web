document.addEventListener("DOMContentLoaded", function () {
    const wrappers = document.querySelectorAll(".rating-wrapper");
  
    wrappers.forEach(wrapper => {
      const rateUrl = wrapper.dataset.rateUrl;
      const csrfToken = wrapper.querySelector("[name=csrfmiddlewaretoken]").value;
      const submitBtn = wrapper.querySelector(".submit-rating-btn");
      const messageDiv = wrapper.querySelector(".rating-message");
      const avgRating = wrapper.querySelector(".average-rating");
  
      submitBtn.addEventListener("click", () => {
        const selected = wrapper.querySelector("input[name='rating']:checked");
        if (!selected) {
          alert("Vui lòng chọn số sao để đánh giá.");
          return;
        }
  
        fetch(rateUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ rating: parseInt(selected.value) }),
        })
          .then(res => res.json())
          .then(data => {
            messageDiv.textContent = data.message;
            messageDiv.style.color = data.success ? "green" : "red";
            messageDiv.style.display = "block";
            if (data.success && data.new_average) {
              avgRating.textContent = `Đánh giá trung bình: ${data.new_average.toFixed(2)}`;
            }
            setTimeout(() => {
              messageDiv.style.display = "none";
            }, 3000);
          })
          .catch(err => {
            messageDiv.textContent = "Đã xảy ra lỗi khi gửi đánh giá.";
            messageDiv.style.color = "red";
            messageDiv.style.display = "block";
            setTimeout(() => {
              messageDiv.style.display = "none";
            }, 3000);
          });
      });
    });
  });
  