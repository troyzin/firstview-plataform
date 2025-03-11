
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardData = () => {
  const [productionsCount, setProductionsCount] = useState(0);
  const [todayProductions, setTodayProductions] = useState([]);
  const [topProductions, setTopProductions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        await fetchProductionsCount();
        await fetchTodayProductions();
        await fetchTopProductions();
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted) {
          setError(error instanceof Error ? error : new Error("Unknown error occurred"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchProductionsCount = async () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const { count, error } = await supabase
      .from('productions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString())
      .lte('created_at', lastDayOfMonth.toISOString());
    
    if (error) {
      console.error("Error fetching productions count:", error);
      return;
    }
    
    setProductionsCount(count || 0);
  };

  const fetchTodayProductions = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data, error } = await supabase
      .from('productions')
      .select(`
        id, 
        title, 
        description, 
        start_date, 
        end_date, 
        client_id,
        clients (
          id, 
          name
        )
      `)
      .gte('start_date', today.toISOString())
      .lt('start_date', tomorrow.toISOString());
    
    if (error) {
      console.error("Error fetching today's productions:", error);
      return;
    }
    
    setTodayProductions(data || []);
  };

  const fetchTopProductions = async () => {
    const { data, error } = await supabase
      .from('productions')
      .select(`
        id, 
        title, 
        client_id,
        clients (
          id, 
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error("Error fetching top productions:", error);
      return;
    }
    
    const formattedData = (data || []).map((item) => {
      // Safely handle client name
      let clientName = 'Cliente não especificado';
      
      // Properly check if clients exists and has the expected properties
      if (item.clients && typeof item.clients === 'object') {
        // Use optional chaining and nullish coalescing to safely access name
        clientName = (item.clients as any)?.name || clientName;
      }
      
      const initials = item.title.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();
      
      return {
        name: item.title,
        initials,
        client: clientName
      };
    });
    
    setTopProductions(formattedData);
  };

  return {
    productionsCount,
    todayProductions,
    topProductions,
    isLoading,
    error
  };
};
