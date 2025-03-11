import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/*
React Context API 工作原理基于 “发布-订阅”模式和React的组件树结构。
核心链接机制是：
1. React 组件树：React 组件树是由React组件构成的层级结构，每个组件都可以订阅React Context。
2. Context对象：作为共享的引用点链接提供者和消费者
3. 内部订阅机制：React在内部管理Context的订阅和更新

1. 创建Context对象
const AuthContext = createContext<AuthContextType | undefined>(undefined);

2. 提供者注册值
<AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
  {children}
</AuthContext.Provider>

AuthProvicer组件使用AuthContext.Provider将值与Context对象关联。当组件渲染时
1. React内部为这个Context建立一个“值容器”
2. 将传入的value存储在这个容器中
3. 记录使用此Context的所有子组件

3. 消费者获取值 useAuth
export function useAuth() {
  const context = useContext(AuthContext);
  // ...
  return context;
}
  
*/


const AuthContext = createContext<AuthContextType | undefined>(undefined);

// {children} - 使用对象解构语法从传入的props中提取children属性
// React.ReactNode - 表示可以是任何React节点，包括字符串、数字、甚至是null或undefined，以及react组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}