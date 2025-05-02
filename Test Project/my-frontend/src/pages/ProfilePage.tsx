import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";
import { useEffect } from "react";

interface ProfileForm {
  name: string;
  timeZone: string;
}

const schema = yup.object({
  name: yup.string().required("Name is required"),
  timeZone: yup.string().required("Time zone is required"),
});

export default function ProfilePage({ token }: { token: string | null }) {
  const { data, isLoading, error } = useProfile(token);
  const update = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: { name: "", timeZone: "" },
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name ?? "",
        timeZone: data.timeZone ?? Intl.supportedValuesOf("timeZone")[0],
      });
    }
  }, [data, reset]);

  if (isLoading) return <p>Loading profile…</p>;
  if (error) return <p className="text-red-600">Error: {error.message}</p>;

  const onSubmit: SubmitHandler<ProfileForm> = (vals) =>
    update.mutate({ name: vals.name, timeZone: vals.timeZone });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-lg space-y-6 py-12 px-4"
    >
      <h1 className="text-2xl font-semibold">Your Profile</h1>

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          {...register("name")}
          className="mt-1 block w-full rounded border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Time Zone</label>
        <select
          {...register("timeZone")}
          className="mt-1 block w-full rounded border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring"
        >
          {Intl.supportedValuesOf("timeZone").map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        {errors.timeZone && (
          <p className="mt-1 text-sm text-red-500">{errors.timeZone.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isLoading ? "Saving…" : "Save Changes"}
      </button>

      {update.isError && (
        <p className="mt-2 text-sm text-red-600">{update.error?.message}</p>
      )}
      {update.isSuccess && (
        <p className="mt-2 text-sm text-green-600">Profile updated!</p>
      )}
    </form>
  );
}
