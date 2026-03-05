<script setup lang="ts">
import cloud from '@/assets/images/illustrations/cloud.png'; // Import your SVG icon
import moon from '@/assets/images/illustrations/moon.png'; // Import your SVG icon
import sunrise from '@/assets/images/illustrations/sunrise.png'; // Import your SVG icon

const role = ref('General Manager');
type TimePeriod = "morning" | "afternoon" | "night";

const motivationText = computed(() => {
    const texts = [
        "Let's make great things happen today—your success is just a click away",
        "Let’s turn your ambitions into accomplishments, one approval at a time!",
        "Let’s move one step closer to your goals together."
    ]

    const index = Math.floor(Math.random() * 3) + 1;
    return texts[index]
})

const bannerImage = computed(() => {
    const timePeriod = getTimePeriod();
    if (timePeriod === "morning") {
        return sunrise;
    } else if (timePeriod === "afternoon") {
        return cloud;
    } else {
        return moon;
    }
})

const greetingText = computed(() => {
    const timePeriod = getTimePeriod();
    if (timePeriod === "morning") {
        return "Good Morning, ";
    } else if (timePeriod === "afternoon") {
        return "Good Afternoon, ";
    } else {
        return "Good Evening, ";
    }
})

function getTimePeriod(): TimePeriod {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning"
  } else if (hour >= 12 && hour < 18) {
    return "afternoon"
  } else {
    return "night"
  }
}

function getFormattedDate(): string {
  const now = new Date();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayName = days[now.getDay()];
  const day = now.getDate().toString().padStart(2, '0');
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}
</script>
<template>
    <VCard
        class="greeting-card"
        flat
    >
        <div class="card-wrapper">
          <VImg
            :src="bannerImage"
            class="banner-image"
          />

          <div class="content-wrapper">
            <div class="top-row">
              <div>
                <p class="greeting">{{ greetingText }} <strong class="greeting-name">Jhon</strong></p>
                <p class="role">{{ role }}</p>
              </div>
              <div class="date">{{ getFormattedDate() }}</div>
            </div>

            <p class="message">
              {{ motivationText }}
            </p>
          </div>
        </div>
      </VCard>
</template>

<style scoped lang="scss">
.greeting-card {
  background: linear-gradient(90deg, #7b6ef6, #967bf6);
  border-radius: 8px;
  padding: 1rem;

  .card-wrapper {
    display: flex;
    align-items: center;

    .banner-image {
        width: 133px;
        height: 120px;
        margin-left: 12px;
        margin-right: 15px;
    }

    .content-wrapper {
      flex: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      .top-row > div {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        p {
          margin: 0;
          padding: 0;
        }
      }

      .top-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .greeting {
          margin: 0;
          color: white;
          font-size: 20px;
          font-weight: bold;
        }

        .greeting-name {
          margin: 0;
          color: white;
          font-size: 30px;
          font-weight: bolder;
        }

        .role {
          margin: 0;
          color: white;
          font-size: 18px;
          font-weight: normal;
        }

        .date {
          color: white;
          font-weight: 500;
          white-space: nowrap;
          font-size: 18px;
        }
      }

      .message {
        margin-top: 2rem;
        color: white;
        font-weight: lighter;
        font-size: 16px;
        opacity: 0.9;
      }
    }
  }
}
</style>
