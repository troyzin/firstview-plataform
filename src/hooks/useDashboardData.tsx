
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
      try {
        // Initialize with defaults first to prevent undefined values
        if (isMounted.current) {
          setTopProductions([]);
          setTodayProductions([]);
          setProductionsCount(0);
        }
        
        // Only attempt to fetch data if component is still mounted
        if (isMounted.current) {
          await fetchProductionsCount();
          await fetchTodayProductions();
          await fetchTopProductions();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted.current) {
          setError(error instanceof Error ? error : new Error("Unknown error occurred"));
        }
      } finally {
        // Always ensure loading state is set to false when done
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
      // Ensure we set empty array even on error
      if (isMounted.current) {
        setTodayProductions([]);
      }
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
        // Set empty array on error
        if (isMounted.current) {
          setTopProductions([]);
        }
        return;
      }
      
      if (isMounted.current && data) {
        const formattedData = data.map(item => {
          // Default values
          let clientName = 'Cliente não especificado';
          const title = item.title || 'Sem título';
          
          // Safely check client name
          if (item.clients) {
            if (typeof item.clients === 'object' && item.clients !== null && 'name' in item.clients) {
              clientName = item.clients.name || clientName;
            }
          }
          
          // Generate initials from title
          let initials = '';
          if (title) {
            initials = title
              .split(' ')
              .slice(0, 2)
              .map(word => word?.[0] || '')
              .join('')
              .toUpperCase();
          }
          
          return {
            name: title,
            initials,
            client: clientName
          };
        });
        
        setTopProductions(formattedData);
      } else if (isMounted.current) {
        // Set empty array when no data
        setTopProductions([]);
      }
    } catch (err) {
      console.error("Exception in fetchTopProductions:", err);
      if (isMounted.current) {
        // Ensure we set default empty array on error
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
