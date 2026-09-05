"use client"
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAdminAuth } from "@/redux/adminAuthSlice";
import { AdminLoginForm } from "@/components/admin-login-form";

export default function LoginPage() {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state: any) => state.adminAuth);
  useEffect(() => { if (!isInitialized) dispatch(checkAdminAuth() as any); }, [dispatch, isInitialized]);
  return <AdminLoginForm />;
}
