<script lang="ts" setup>
import { Document } from '@/models/document/document';
import { User } from '@/models/users/users';
import companyLogoDummy1 from '@images/custom/dummy-company-logo-1.png';

interface Props {
  document: Document;
  bookingNumber: string | null;
  internalRecipients: User[]
  externalRecipients: string
  signers: User[]
  withLetterHead: boolean
}

const props = defineProps<Props>();

const currentDate = computed(() => {
  const now = new Date()
  return now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})
</script>

<template>
    <div class="preview-container">
    <div class="a4-preview">
        <div class="letter">
            <div class="letterhead" v-if="props.withLetterHead">
              <VImg class="logo" :src="companyLogoDummy1" />
              <div class="info">
                <h1 class="title">Pacific Innovations Corporation</h1>
                <p class="subtitle">455 Montgomery Street, Suite 2100, Financial District, San Francisco, CA 94104 <br>
                  United States of America
                </p>
                <p class="code">Phone: +1 (415) 555‑7890 | Website: pacificinnovations.com</p>
              </div>
            </div>

            <h1 class="title"></h1>
            <div class="sub-title-right">
              <p class="text">{{ currentDate }}</p>
              <p v-show="props.bookingNumber != null" class="text">Ref: {{ props.bookingNumber }}</p>
              <p v-show="props.document.type != ''" class="text">{{ props.document.type == '1' ? 'Internal' : 'External' }}</p>
            </div>
            <div class="dear">
              <p class="title">Dear,</p>
              <div v-for="(recipient, index) in props.internalRecipients" v-if="props.internalRecipients.length > 0">
                <p class="name">Mr/Ms. {{ recipient.firstName + ' ' + recipient.lastName + ' - ' + recipient.position.name}}{{ index != props.internalRecipients.length - 1 ? ',' : ''}}</p>
              </div>
              <div v-if="props.externalRecipients !== ''" v-for="(recipient, index) in props.externalRecipients.split(',')" :key="index">
                <p class="name">{{ recipient.trim() }}{{ index != props.externalRecipients.split(',').length - 1 && props.externalRecipients.split(',').length > 1 ? ',' : ''}}</p>
              </div>
            </div>

            <div class="subject" v-if="props.document.subject != ''">
              <span class="title">Subject: </span>{{ props.document.subject }}
            </div>

            <div class="body" v-html="props.document.body"></div>

            <div class="closing">
              <p>Sincerely,</p>
            </div>

          <div class="signature" v-if="signers.length > 0">
            <div class="signers">
              <div class="signer" v-for="(signer, index) in signers" :key="index">
                <p class="name">{{ signer.firstName }} {{ signer.lastName }}</p>
                <p class="position">{{ signer.position.name }}</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<style lang="scss">
.preview-container {
  width: 100%;
  max-width: 900px; // limit max size so it doesn't get too big
  margin: 0 auto;
  padding: 1rem;

  .a4-preview {
    position: relative;
    width: 100%;
    aspect-ratio: 210 / 297; // keep A4 aspect ratio
    background: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 2rem;
    box-sizing: border-box;
    overflow: hidden;
    
    // make sure text scales if screen is very small
    font-size: 1rem;

    @media (max-width: 600px) {
      padding: 1rem;
      font-size: 0.9rem;
    }
  }
}

.letter {
  display: flex;
  flex-direction: column;
  font-family: 'Times New Roman', Times, serif;

  .letterhead {
    position: relative;
    display: flex;
    justify-content: center; // center the .info block horizontally
    align-items: center;     // center vertically if you want
    padding: 1rem;
    border-bottom: 4px solid #000;

    .logo {
      position: absolute;
      left: 0;               // stick to the left edge
      width: 80px;       // adjust based on your design
      height: 80px;
    }

    .info {
      text-align: center;
      margin-left: 50px;

      .title {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
      }

      .subtitle {
        font-size: 1rem;
        margin: 0.5rem 0;
        line-height: 1.4;
      }

      .code {
        font-size: 0.9rem;
        margin: 0;
      }
    }
  }

  .sub-title-right {
    display: inline-block;
    text-align: right;
    margin-left: auto;
    margin-top: 50px;

    .text {
      text-align: left;
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: -2px;
    }
  }

  .subject {
    display: flex;          // keeps on the same line
    align-items: center;    // vertically center if needed
    margin-top: 2rem;

    .title {
      font-weight: 700;     // makes "Subject:" bold
      margin-right: 0.25rem; // small space between label and value
    }
  }

  .dear {
    font-size: 1rem;

    .title {
      font-style: italic;
    }

    > p {
      margin-bottom: 0rem; // spacing after "Dear,"
    }

    .name {
      margin-bottom: 0.25rem; // spacing between recipient names
      font-weight: 600;

      &:last-child {
        margin-bottom: 0; // remove margin after last name
      }
    }
  }

  .body {
    flex: 1;
    font-size: 1rem;
    line-height: 1.6;
    text-align: justify;
    margin-bottom: 2rem;
    margin-top: 3rem;

    p {
      margin-bottom: 1rem;
    }
  }

  .closing {
    margin-top: auto;
    font-size: 1rem;

    p {
      margin-bottom: 0.5rem;
    }
  }

  .signature {
    margin-top: 10rem;

    .signers {
      display: flex;
      flex-wrap: wrap;    // allows items to move to next line when space runs out
      gap: 2rem;          // adjust gap between signers
    }

    .signer {
      display: flex;
      flex-direction: column;
      align-items: flex-start;  // center name & position
      min-width: 250px;     // optional: prevent too small blocks
    }

    .name {
      font-weight: 700;
      margin-bottom: 0rem;
    }

    .position {
      font-style: normal;
    }
  }
}

.left-text {
  text-align: left;
}

.center-text {
  text-align: center;
}

.right-text {
  text-align: right;
}

.justify-text { text-align: justify; }

</style>
