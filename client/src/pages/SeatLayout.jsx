import React, { use, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets, dummyDateTimeData, dummyShowsData } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";

const SeatLayout = () => {
  const groupRows = [
    ["A", "B"],
    ["C", "D"],
    ["E", "F"],
    ["G", "H"],
    ["I", "J"],
  ];
  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = React.useState([]);
  const [selectedTime, setSelectedTime] = React.useState(null);
  const [show, setShow] = React.useState(null);

  const [occupiedSeats, setOccupiedSeats] = React.useState([]);

  const navigate = useNavigate();

  const { axios, getToken, user } = useAppContext();

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        setShow(data);
      }
    } catch (error) {
      console.error("Error fetching show:", error);
    }
  };

  // const renderSeats = (row, count=9)=>(
  //   <div>

  //   </div>
  // )
  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast("Please select a time first");
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
      return toast("You can select up to 5 seats only");
    }
    if (occupiedSeats.includes(seatId)) {
      return toast.error("This seat is already occupied.");
    }
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((seat) => seat !== seatId)
        : [...prev, seatId]
    );
  };
  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer 
                
                ${selectedSeats.includes(seatId) && "bg-primary text-white"}${
                occupiedSeats.includes(seatId) && "opacity-50"
              }`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(
        `/api/booking/seats/${selectedTime.showId}`
      );
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats);
      } else {
        toast.error("Failed to fetch occupied seats.");
      }
    } catch (error) {
      console.log("Error fetching occupied seats:", error);
    }
  };

  const bookTickets = async () => {
    try {
      if (!user) {
        return toast.error("Please login to book tickets.");
      }
      if (!selectedTime || selectedSeats.length === 0) {
        return toast.error("Please select a time and at least one seat.");
      }

      const { data } = await axios.post('/api/booking/create', {
        showId: selectedTime.showId,
         selectedSeats,
      }, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        // toast.success("Tickets booked successfully.");
        // navigate("/my-bookings");

        window.location.href = data.url; // Redirect to Stripe payment page
      } else {
        toast.error("Failed to book tickets.");
      }
    } catch (error) {
      console.log("Error booking tickets:", error);
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats();
    }
  }, [selectedTime]);

  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30">
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        {/* Available timing */}
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.dateTime[date].map((item) => (
            <div
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-3 border-b border-primary/20 cursor-pointer hover:bg-primary/20 transition-all ${
                selectedTime?.time === item.time
                  ? "bg-primary text-white"
                  : "text-gray-400"
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        {/* Seats Layout */}
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />
        <h1 className="text-2xl font-semibold mb-4">Select Your Slot</h1>
        <img src={assets.screenImage} alt="Screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>
        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>

          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>{group.map((row) => renderSeats(row))}</div>
            ))}
          </div>
        </div>

        <button
          onClick={bookTickets}
          className="flex items-center gap-2 bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
        >
          Procced Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default SeatLayout;
