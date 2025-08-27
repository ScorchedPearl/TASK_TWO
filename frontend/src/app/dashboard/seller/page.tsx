"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/providers/userprovider";

export default function Page() {
 const {logout}= useUser();
 return (
  <div>
   <Button onClick={()=>{
    logout();
   }}>
    Logout
   </Button>
  </div>
 );
}