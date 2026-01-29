import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Switch,
  Dimensions,
} from "react-native";
import { useEffect, useState, createContext, useMemo } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";

/* -------------------- THEME CONTEXT -------------------- */
export const ThemeContext = createContext({
  dark: true,
  toggleTheme: () => {},
});

/* -------------------- TYPES -------------------- */
type MenuItem = {
  title: string;
  time?: string;
  price: number;
  menu?: string;
  portion?: number;
};

type MenuSection = {
  title: string;
  time: string;
  items: MenuItem[];
};

type Booking = {
  section: string;
  item: string;
  price: number;
  token: string;
  expiresAt: number;
  used: boolean;
};

type DayMenu = {
  day: string;
  meals: Record<string, string>;
};

type MenuResponse = Record<string, DayMenu>;

/* -------------------- CONSTANTS -------------------- */
const API_URL = "http://192.168.252.105:8000/menu/daily";

/* -------------------- MENU STRUCTURE -------------------- */
const MENU_STRUCTURE: MenuSection[] = [
  {
    title: "Morning",
    time: "8:00 – 11:00 AM",
    items: [
      { title: "BREAKFAST", time: "8:00 – 8:40 AM", price: 65 },
      { title: "DOSA COUNTER", time: "8:00 – 11:00 AM", price: 70 },
    ],
  },
  {
    title: "Afternoon",
    time: "11:45 AM – 2:00 PM",
    items: [
      { title: "THALI LUNCH", price: 65 },
      { title: "VEG COMBO", price: 75 },
      { title: "NON VEG COMBO", price: 85 },
      { title: "SALAD BAR", price: 50 },
    ],
  },
  {
    title: "Evening",
    time: "5:00 – 7:30 PM",
    items: [
      { title: "PAID SNACKS", time: "5:00 – 6:00 PM", price: 40 },
      { title: "LTTS SNACKS", time: "7:00 – 7:30 PM", price: 0 },
    ],
  },
  {
    title: "Night",
    time: "8:15 – 9:00 PM",
    items: [
      { title: "THALI DINNER", time: "8:15 – 9:00 PM", price: 65 },
      { title: "NON VEG COMBO", time: "8:15 – 9:00 PM", price: 85 },
    ],
  },
];
const parseStartTime = (timeRange: string) => {
  // supports: "8:00 – 11:00 AM" OR "11:45 – 12:15"

  const match = timeRange.match(/(\d{1,2}:\d{2})/);
  if (!match) return null;

  let [hours, minutes] = match[1].split(":").map(Number);

  // crude AM/PM inference
  if (hours < 7) hours += 12;

  const d = new Date();
  d.setHours(hours, minutes, 0, 0);

  return d;
};

const isSameDay = (a: Date, b: Date) =>
  a.toDateString() === b.toDateString();
const getPortionKey = (itemTitle: string, sectionTitle: string) => {
  if (itemTitle === "VEG COMBO") return "PORTION-VC";
  if (itemTitle === "SALAD BAR") return "PORTION-SB";

  if (itemTitle === "NON VEG COMBO" && sectionTitle === "Afternoon")
    return "PORTION-NVC";

  if (itemTitle === "NON VEG COMBO" && sectionTitle === "Night")
    return "PORTION-D";

  return null;
};

/* -------------------- COMPONENT -------------------- */
export default function Home() {

  const [localMenu, setLocalMenu] = useState<MenuResponse | null>(null);

  const [dateIndex, setDateIndex] = useState(0);

  const router = useRouter();

  const [darkTheme, setDarkTheme] = useState(true);
  const [hamburgerVisible, setHamburgerVisible] = useState(false);

  const [currentBlock, setCurrentBlock] = useState<string | null>(null);
  const [currentFloor, setCurrentFloor] = useState<string | null>(null);

  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const [pendingBooking, setPendingBooking] = useState<{
    section: string;
    item: string;
    price: number;
  } | null>(null);

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [orders, setOrders] = useState<Booking[]>([]);
const [ordersVisible, setOrdersVisible] = useState(false);
const [confirmClearVisible, setConfirmClearVisible] = useState(false);


  const toggleTheme = () => setDarkTheme(p => !p);
  const today = new Date();
  const availableDates = useMemo(() => {
  if (!localMenu) return [];
  return Object.keys(localMenu).sort(); // yyyy-mm-dd already sortable
}, [localMenu]);
const selectedDateKey = availableDates[dateIndex];

const selectedDateObj = useMemo(() => {
  return selectedDateKey ? new Date(selectedDateKey) : new Date();
}, [selectedDateKey]);

const selectedDateLabel = selectedDateObj.toDateString();


const prevDisabled = dateIndex <= 0;
const nextDisabled = dateIndex >= availableDates.length - 1;

const handlePrev = () => {
  if (!prevDisabled) setDateIndex(i => i - 1);
};

const handleNext = () => {
  if (!nextDisabled) setDateIndex(i => i + 1);
};


const canBookSection = (sectionTime: string) => {
  if (!isSameDay(selectedDateObj, today)) return false;

  const sectionStart = parseStartTime(sectionTime);
  if (!sectionStart) return false;

  const bookingStart = new Date(sectionStart.getTime() - 4 * 60 * 60 * 1000);
  const bookingEnd = new Date(sectionStart.getTime()+ 6 * 60 * 60 * 1000);

  const now = new Date();

  return now >= bookingStart && now <= bookingEnd;
};


  /* -------------------- AFTERNOON TIME LOGIC -------------------- */
  const getAfternoonTime = (block: string | null, floor: string | null) => {
    if (!block || !floor) return "11:45 AM – 2:00 PM";
    const floorNum = floor.match(/\d+/)?.[0] || "Gr";

    if (block === "WB-II") {
      if (["1", "2", "3", "4"].includes(floorNum)) return "11:45 – 12:15";
      if (["5", "6", "7", "8"].includes(floorNum)) return "12:45 – 1:15";
    }
    if (block === "EB-II") return "12:15 – 12:45";
    if (block === "WB-IV") return "11:45 – 1:15";

    return "11:45 AM – 2:00 PM";
  };

  /* -------------------- LOAD SETUP -------------------- */
  useEffect(() => {
  loadOrders();
}, []);

  useEffect(() => {
    AsyncStorage.getItem("userSetup").then(saved => {
      if (saved) {
        const { block, floor } = JSON.parse(saved);
        setCurrentBlock(block);
        setCurrentFloor(floor);
      }
    });
  }, []);

  /* -------------------- FETCH MENU -------------------- */
  useEffect(() => {
  fetch(API_URL)
    .then(res => res.json())
    .then((data: MenuResponse) => {
      setMenuData(data);
      setLocalMenu(JSON.parse(JSON.stringify(data))); // deep copy

      // 👉 AUTO SELECT TODAY
      const keys = Object.keys(data).sort();
      const todayKey = new Date().toISOString().split("T")[0];
      const todayIndex = keys.indexOf(todayKey);

      setDateIndex(todayIndex >= 0 ? todayIndex : 0);
    });
}, []);


const loadOrders = async () => {
  const stored = await AsyncStorage.getItem("bookings");
  if (!stored) {
    setOrders([]);
    return;
  }

  const all: Booking[] = JSON.parse(stored);
  const now = Date.now();

  const active = all.filter(b => !b.used && b.expiresAt > now);
  setOrders(active);
};


  /* -------------------- PAYMENT SUCCESS -------------------- */
  const handlePaymentSuccess = async () => {
  if (!pendingBooking) return;

  const booking: Booking = {
    ...pendingBooking,
    token: Math.random().toString(36).substring(2, 10),
    expiresAt: Date.now() + 6 * 60 * 60 * 1000,
    used: false,
  };

  // save to bookings list
  const existing = await AsyncStorage.getItem("bookings");
  const all: Booking[] = existing ? JSON.parse(existing) : [];
  all.push(booking);
  await AsyncStorage.setItem("bookings", JSON.stringify(all));

  setActiveBooking(booking);

  /* FRONTEND PORTION -1 */
  setLocalMenu(prev => {
    if (!prev) return prev;

    const dateKey = selectedDateObj.toISOString().split("T")[0];
    const portionKey = getPortionKey(pendingBooking.item, pendingBooking.section);
    if (!portionKey) return prev;

    const updated = {
  ...prev,
  [dateKey]: {
    ...prev[dateKey],
    meals: {
      ...prev[dateKey].meals,
    },
  },
};

const current = Number(updated[dateKey].meals[portionKey] || 0);

if (current > 0) {
  updated[dateKey].meals[portionKey] = String(current - 1);
}

return updated;

  });

  await fetch("http://192.168.252.101:8000/menu/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: selectedDateObj.toISOString().split("T")[0],
      section: pendingBooking.section,
      item: pendingBooking.item,
    }),
  });

  setPendingBooking(null);
  await loadOrders();
};

const currentMenu = useMemo<DayMenu>(() => {
  const key = selectedDateObj.toISOString().split("T")[0];

  if (!localMenu) {
    return {
      day: selectedDateObj.toDateString(),
      meals: {},
    };
  }

  return (
    localMenu[key] || {
      day: selectedDateObj.toDateString(),
      meals: {},
    }
  );
}, [localMenu, selectedDateObj]);




  /* -------------------- MERGED DYNAMIC MENU -------------------- */
const noMenuForDay = Object.keys(currentMenu.meals).length === 0;

const dynamicMenu: MenuSection[] = useMemo(() => {
  if (noMenuForDay) return [];

  return MENU_STRUCTURE.map((section: MenuSection) => ({
    ...section,
    items: section.items.map((item: MenuItem) => {
      const portionKey = getPortionKey(item.title, section.title);

      return {
        ...item,
        time:
          section.title === "Afternoon"
            ? getAfternoonTime(currentBlock, currentFloor)
            : item.time,

        menu: currentMenu.meals[item.title] ?? "No menu available",

        portion:
          portionKey && currentMenu.meals[portionKey] !== undefined
            ? Number(currentMenu.meals[portionKey])
            : undefined,
      };
    }),
  }));
}, [currentMenu, currentBlock, currentFloor, noMenuForDay]);


  /* -------------------- UI -------------------- */
  return (
    <ThemeContext.Provider value={{ dark: darkTheme, toggleTheme }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: darkTheme ? "#0E0E0E" : "#fff" }]}>
        <ScrollView style={styles.container}contentContainerStyle={{ paddingTop: 20}}>
          {/* HEADER */}
<View style={styles.topHeader}>

  {ordersVisible && (
  <Modal transparent animationType="fade">
    <View style={[styles.overlay, { justifyContent: "flex-start", paddingTop: 100 }]}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Your Orders</Text>

        <ScrollView style={{ width: "100%", maxHeight: 300 }}>
          {orders.length === 0 && (
            <Text style={{ color: "#aaa", textAlign: "center" }}>
              No active orders
            </Text>
          )}

          {orders.map(order => (
            <TouchableOpacity
              key={order.token}
              style={styles.subCard}
              onPress={() => {
                setOrdersVisible(false);
                setActiveBooking(order);
              }}
            >
              <Text style={styles.subTitle}>{order.item}</Text>
              <Text style={{ color: "#aaa", fontSize: 12 }}>
                Valid till {new Date(order.expiresAt).toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.payBtn} onPress={() => setOrdersVisible(false)}>
          <Text style={{ fontWeight: "700" }}>Close</Text>
        </TouchableOpacity>

        {orders.length > 0 && (
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: "#FF6B6B" }]}
            onPress={() => setConfirmClearVisible(true)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Clear Orders</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </Modal>
)}


  {/* Hamburger */}
  <TouchableOpacity onPress={() => setHamburgerVisible(true)}>
    <Text style={styles.hamburger}>☰</Text>
  </TouchableOpacity>

  {/* Center Date */}
  <View style={styles.headerRow}>
    <View style={styles.dateWrapper}>
      <Text style={styles.dayText}>
        {currentMenu?.day || selectedDateLabel}
      </Text>

      <View style={styles.dateRow}>
        <TouchableOpacity disabled={prevDisabled} onPress={handlePrev}>
          <Text style={[styles.navText, prevDisabled && { opacity: 0.3 }]}>☚</Text>
        </TouchableOpacity>

        < Text style={styles.dateText}>{selectedDateLabel}</Text>


        <TouchableOpacity disabled={nextDisabled} onPress={handleNext}>
          <Text style={[styles.navText, nextDisabled && { opacity: 0.3 }]}>☛</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>

  {/* Spacer keeps center alignment */}
  <View style={{ width: 24 }} />

</View>


          {/* BLOCK / FLOOR */}
          {currentBlock && (
            <View style={styles.setupBox}>
              <Text style={styles.setupText}>Block: {currentBlock}</Text>
              <Text style={styles.setupText}>Floor: {currentFloor}</Text>
            </View>
          )}
          {/* MENU */}
{dynamicMenu.map(section => {
  const bookingAllowed =
  section.title === "Afternoon"
    ? canBookSection(getAfternoonTime(currentBlock, currentFloor))
    : canBookSection(section.time);

  return (
    <View key={section.title}>
      {/* MAIN CARD */}
      <TouchableOpacity
        style={styles.mainCard}
        onPress={() =>
          setExpandedSection(
            expandedSection === section.title ? null : section.title
          )
        }
      >
        {confirmClearVisible && (
  <Modal transparent animationType="fade">
    <View style={styles.overlay}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Clear Orders?</Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: "#FF6B6B", flex: 1 }]}
            onPress={async () => {
              await AsyncStorage.removeItem("bookings");
              setOrders([]);
              setConfirmClearVisible(false);
              setOrdersVisible(false);
            }}
          >
            <Text style={{ color: "#fff" }}>Yes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payBtn, { flex: 1 }]}
            onPress={() => setConfirmClearVisible(false)}
          >
            <Text>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)}

        <Text style={styles.mainTitle}>{section.title}</Text>
        <Text>{section.time}</Text>

      </TouchableOpacity>

      {/* SUB CARDS */}
      {expandedSection === section.title &&
  section.items.map((item) => {
    const hasMeals = currentMenu ? Object.keys(currentMenu.meals).length > 0 : false;

    const portionAvailable =
      !hasMeals ? false : item.portion === undefined || item.portion > 0;


    const canBookItem = bookingAllowed && portionAvailable;

    return (
      <TouchableOpacity
          key={item.title}
          style={[styles.subCard, !canBookItem && { opacity: 0.4 }]}
          disabled={!canBookItem}
          onPress={() =>
            canBookItem &&
            setPendingBooking({
              section: section.title,
              item: item.title,
              price: item.price,
            })
          }
        >

        {/* TITLE + PRICE */}
        <View style={styles.subHeaderRow}>
          <Text style={styles.subTitle}>{item.title}</Text>
          <Text style={styles.subPrice}>₹{item.price}</Text>
        </View>

        {/* MENU */}
        <Text style={styles.subTime}>{item.time}</Text>
        <Text style={styles.subMenu}>{item.menu}</Text>


        {/* 🔴 PUT YOUR PORTION CODE HERE 🔴 */}
        {item.portion !== undefined && item.portion > 0 && (
          <Text style={{ color: "#aaa", fontSize: 12 }}>
            Portions left: {item.portion}
          </Text>
        )}

        {item.portion === 0 && (
          <Text style={{ color: "#FF6B6B", fontSize: 12 }}>
            Sold out
          </Text>
        )}

        {/* BOOKING CLOSED */}
        {!canBookItem && (
          <Text
            style={{
              color: "#FF6B6B",
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Booking closed
          </Text>
        )}
      </TouchableOpacity>
    );
  })}
    </View>
  );
})}
</ScrollView>
         {/* PAYMENT MODAL */}
        {pendingBooking && (
          <Modal transparent animationType="slide">
            <View style={styles.overlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Confirm Payment</Text>
                <Text style={styles.modalText}>
                  {pendingBooking.section} → {pendingBooking.item}
                </Text>
                <Text style={styles.modalText}>
                  Amount: ₹{pendingBooking.price}
                </Text>

                <TouchableOpacity style={styles.payBtn} onPress={handlePaymentSuccess}>
                  <Text style={{ fontWeight: "700" }}>Pay Now</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setPendingBooking(null)}>
                  <Text style={{ color: "#aaa", marginTop: 10 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* QR MODAL */}
        {activeBooking && (
          <Modal transparent animationType="fade">
            <View style={styles.overlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Booking Confirmed ✅</Text>

                <QRCode value={activeBooking.token} size={180} />

                <Text style={styles.modalText}>
                  Valid till:{" "}
                  {new Date(activeBooking.expiresAt).toLocaleTimeString()}
                </Text>

                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={() => setActiveBooking(null)}
                >
                  <Text style={{ fontWeight: "700" }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        {/* HAMBURGER MENU */}
      <Modal
        transparent
        animationType="slide"
        visible={hamburgerVisible}
        onRequestClose={() => setHamburgerVisible(false)}
      >
        <TouchableOpacity
          style={styles.hamburgerOverlay}
          activeOpacity={1}
          onPress={() => setHamburgerVisible(false)}
        >
          <View style={styles.hamburgerMenu}>
            <Text style={styles.hamburgerTitle}>Settings</Text>

            <TouchableOpacity
              style={styles.hamburgerItem}
              onPress={() => {
                setHamburgerVisible(false);
                router.push("/setup");
              }}
            >
              <Text style={styles.hamburgerText}>Update Block / Floor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hamburgerItem}
              onPress={async () => {
                await loadOrders();
                setOrdersVisible(true);
                setHamburgerVisible(false);
              }}
            >
              <Text style={styles.hamburgerText}>Your Orders</Text>
            </TouchableOpacity>


            <View style={styles.hamburgerRow}>
              <Text style={styles.hamburgerText}>Dark Theme</Text>
              <Switch value={darkTheme} onValueChange={toggleTheme} />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  container: {
    paddingHorizontal: 16,
  },

  /* ---------- HEADER ---------- */
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 48,
  },

  hamburger: {
    fontSize: 24,
    color: "#FFD54F",
  },

  dateWrapper: {
    alignItems: "center",
  },

  dayText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },

  dateText: {
    color: "#aaa",
    fontSize: 14,
  },

  /* ---------- SETUP ---------- */
  setupBox: {
    backgroundColor: "#1C1C1C",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },

  setupText: {
    color: "white",
    fontSize: 16,
  },

  /* ---------- MENU ---------- */
  mainCard: {
    backgroundColor: "#FFD54F",
    padding: 18,
    borderRadius: 16,
    marginBottom: 10,
  },

  mainTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  subCard: {
    backgroundColor: "#1C1C1C",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    marginLeft: 10,
  },

  subTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  subTime: {
    color: "#aaa",
    fontSize: 12,
  },

  subMenu: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 2,
  },

  subPrice: {
    color: "#FFD54F",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },

  subHeaderRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

  /* ---------- MODALS ---------- */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#1C1C1C",
    padding: 24,
    borderRadius: 20,
    width: width * 0.85,
    alignItems: "center",
  },

  modalTitle: {
    color: "#FFD54F",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  modalText: {
    color: "white",
    marginBottom: 6,
  },

  payBtn: {
    backgroundColor: "#FFD54F",
    padding: 14,
    borderRadius: 20,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  hamburgerOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  alignItems: "flex-end",
},

hamburgerMenu: {
  width: width * 0.6,
  height: "100%",
  backgroundColor: "#1C1C1C",
  padding: 20,
},

hamburgerTitle: {
  color: "#FFD54F",
  fontSize: 22,
  fontWeight: "700",
  marginBottom: 30,
},

hamburgerItem: {
  marginBottom: 25,
},

hamburgerText: {
  color: "white",
  fontSize: 18,
  fontWeight: "600",
},

hamburgerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},
  headerRow: {
    flex: 1,
    alignItems: "center",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 12,
  },

  navText: {
    color: "#FFD54F",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 6,
  },


});
