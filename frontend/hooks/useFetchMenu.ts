// hooks/useFetchMenu.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

const useFetchMenu = (date: string) => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://192.168.29.115:8000/menu?date=${date}`)
      .then(res => setMenu(res.data))
      .finally(() => setLoading(false));
  }, [date]);

  return { menu, loading };
};

export default useFetchMenu;
