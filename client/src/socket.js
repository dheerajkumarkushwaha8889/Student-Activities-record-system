import { io } from "socket.io-client";

const socket = io("https://student-activities-record-system.onrender.com", { autoConnect: false });

export default socket;
