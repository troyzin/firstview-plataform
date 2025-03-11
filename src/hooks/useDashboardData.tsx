
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardData = () => {
  const [productionsCount, setProductionsCount] = useState(0);
  const [todayProductions, setTodayProductions] = useState([]);
  const [topProductions, setTopProductions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    // Set the ref to true when the component mounts
    isMounted.current = true;
    
    const fetchData = async () => {
      if (!isMounted.current) return;
      
      setIsLoading(true);
      try {
        await fetchProductionsCount();
        await fetchTodayProductions();
        await fetchTopProductions();
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted.current) {
          setError(error instanceof Error ? error : new Error("Unknown error occurred"));
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    // Clean up function that sets isMounted to false when the component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array so it only runs once

  const fetchProductionsCount = async () => {
    if (!isMounted.current) return;
    
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
    
    if (isMounted.current) {
      setProductionsCount(count || 0);
    }
  };

  const fetchTodayProductions = async () => {
    if (!isMounted.current) return;
    
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
    
    if (isMounted.current) {
      setTodayProductions(data || []);
    }
  };

  const fetchTopProductions = async () => {
    if (!isMounted.current) return;
    
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
    
    if (isMounted.current) {
      const formattedData = (data || []).map((item) => {
        // Safely handle client name
        let clientName = 'Cliente não especificado';
        
        // Properly check if clients exists and has the expected properties
        if (item.clients && typeof item.clients === 'object') {
          // Use optional chaining and nullish coalescing to safely access name
          clientName = item.clients?.name || clientName;
        }
        
        const initials = item.title
          .split(' ')
          .slice(0, 2)
          .map(word => word[0])
          .join('')
          .toUpperCase();
        
        return {
          name: item.title,
          initials,
          client: clientName
        };
      });
      
      setTopProductions(formattedData);
    }
  };

  return {
    productionsCount,
    todayProductions,
    topProductions,
    isLoading,
    error
  };
};
