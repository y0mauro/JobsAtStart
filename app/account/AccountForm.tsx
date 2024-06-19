"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Check, Router } from "lucide-react";
import { get } from "http";
import { useRouter } from "next/navigation";

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(
    user?.user_metadata.first_name
  );
  const [username, setUsername] = useState<string>(
    user?.user_metadata.last_name
  );
  const [linkedin, setLinkedin] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`first_name, last_name, username, linkedin, avatar_url`)
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setLinkedin(data.linkedin);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert("Error loading user data!");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  async function updateProfile({
    username,
    first_name,
    last_name,
    linkedin,
    avatar_url,
  }: {
    username: string | null;
    first_name: string;
    last_name: string;
    linkedin: string | null;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        first_name,
        last_name,
        username,
        linkedin,
        avatar_url,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      toast({
        action: (
          <div className="w-full flex gap-2 items-center ">
            <Check color="green" size={50} />
            <span className="first-letter:capitalize">
              {`Profile updated!`}
            </span>
          </div>
        ),
      });

      router.refresh();
    } catch (error) {
      alert("Error updating the data!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className=" max-w-5xl m-auto my-10  flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={user?.email || ""} disabled />
      </div>

      <div className="flex gap-2 w-full ">
        <div>
          <Label htmlFor="first_name">First Name</Label>

          <Input
            id="first_name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="last_name">Last Name</Label>

          <Input
            id="last_name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <Label htmlFor="avatar_url">Avatar URL</Label>
          <Input
            id="avatar_url"
            type="text"
            value={avatar_url || ""}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="username">Linkedin</Label>
          <Input
            id="linkedin"
            type="text"
            value={linkedin || ""}
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </div>
        <div className="flex  justify-between mt-5">
          <form action="/auth/signout" method="post">
            <Button
              className="button block"
              type="submit"
              variant={"destructive"}
            >
              Sign out
            </Button>
          </form>
          <Button
            className="button primary block"
            onClick={() =>
              updateProfile({
                first_name: firstName,
                last_name: lastName,
                username,
                linkedin,
                avatar_url,
              })
            }
            disabled={loading}
          >
            {loading ? "Loading ..." : "Update"}
          </Button>
        </div>
      </div>
    </div>
  );
}