import { ImageSourcePropType } from "react-native";

export type statusType = {
  id: string | number | null;
  name: string;
  user_picture: ImageSourcePropType | null;
  status: {
    caption: string;
    media: ImageSourcePropType | null;
  }[];
};

export const status: statusType[] = [
  {
    id: 1,
    name: "Adebayo Bunmi Solomon",
    user_picture: require("@/whats-app/image/status.jpeg"),
    status: [
      {
        caption: "How are you bunmi",
        media: require("@/whats-app/image/status.jpeg"),
      },
      {
        caption: "How are you solomon, Hope you are doing great",
        media: require("@/whats-app/image/status2.jpeg"),
      },
    ],
  },
  {
    id: 2,
    name: "Adebayo Bunmi Solomon",
    user_picture: null,
    status: [
      {
        caption: "How are you bunmi",
        media: require("@/whats-app/image/status.jpeg"),
      },
    ],
  },
  {
    id: 3,
    name: "Adeyemo Joshua",
    user_picture: require("@/whats-app/image/status.jpeg"),
    status: [
      {
        caption: "How are you bunmi",
        media: require("@/whats-app/image/status2.jpeg"),
      },
      {
        caption: "How are you solomon, Hope you are doing great",
        media: require("@/whats-app/image/status.jpeg"),
      },
      {
        caption: "How are you bunmi",
        media: require("@/whats-app/image/status3.jpeg"),
      },
      {
        caption: "How are you solomon, Hope you are doing great",
        media: require("@/whats-app/image/status4.jpeg"),
      },
    ],
  },
  {
    id: 4,
    name: "Olabanjo Olakunori",
    user_picture: null, //require("@/whats-app/image/status.jpeg"),
    status: [
      {
        caption: "How are you bunmi",
        media: require("@/whats-app/image/status.jpeg"),
      },
      {
        caption: "How are you solomon, Hope you are doing great",
        media: require("@/whats-app/image/status.jpeg"),
      },
    ],
  },
  {
    id: 5,
    name: "Jwanshak Mweltok",
    user_picture: null, //require("@/whats-app/image/status.jpeg"),
    status: [
      {
        caption: "How are you bunmi",
        media: require("@/whats-app/image/status.jpeg"),
      },
      {
        caption: "How are you solomon, Hope you are doing great",
        media: require("@/whats-app/image/status.jpeg"),
      },
    ],
  },
  {
    id: 6,
    name: "Yarima Shammah",
    user_picture: require("@/whats-app/image/status.jpeg"),
    status: [
      {
        caption: "How are you bunmi",
        media: require("@/whats-app/image/status.jpeg"),
      },
      {
        caption: "How are you solomon, Hope you are doing great",
        media: require("@/whats-app/image/status.jpeg"),
      },
    ],
  },
];
