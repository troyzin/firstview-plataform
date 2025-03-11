
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
        // Make sure we always set loading to false, even if data is empty or errors occurred
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
    
    try {
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
    } catch (err) {
      console.error("Exception in fetchProductionsCount:", err);
    }
  };

  const fetchTodayProductions = async () => {
    if (!isMounted.current) return;
    
    try {
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
    } catch (err) {
      console.error("Exception in fetchTodayProductions:", err);
    }
  };

  const fetchTopProductions = async () => {
    if (!isMounted.current) return;
    
    try {
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
      
      if (isMounted.current && data) {
        const formattedData = data.map((item) => {
          // Safely handle client name with proper type checking
          let clientName = 'Cliente não especificado';
          
          // Check if clients exists and has a name property that's not null or undefined
          if (item.clients && typeof item.clients === 'object' && item.clients.name) {
            clientName = item.clients.name;
          }
          
          // Handle case where title might be null or undefined
          const title = item.title || 'Sem título';
          
          // Generate initials only if title is not empty
          const initials = title
            .split(' ')
            .slice(0, 2)
            .map(word => word?.[0] || '')
            .join('')
            .toUpperCase();
          
          return {
            name: title,
            initials,
            client: clientName
          };
        });
        
        setTopProductions(formattedData);
      } else if (isMounted.current) {
        // If no data, set empty array
        setTopProductions([]);
      }
    } catch (err) {
      console.error("Exception in fetchTopProductions:", err);
      if (isMounted.current) {
        // Make sure we set a default empty array even on error
        setTopProductions([]);
      }
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
