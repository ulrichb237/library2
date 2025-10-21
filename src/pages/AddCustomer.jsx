import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { customerApi } from '../utils/api.js';
import toast from 'react-hot-toast';

const schema = yup.object({
  firstName: yup.string().required('Prénom requis').max(80),
  lastName: yup.string().required('Nom requis').max(120),
  email: yup.string().required('Email requis').email('Email invalide'),
}).required();

export default function AddCustomer() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    try {
      await customerApi.post('addCustomer', values);
      toast.success('Client ajouté');
      reset();
    } catch {
      toast.error("Échec de l'ajout");
    }
  };

  return (
    <section className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6 text-primary">Ajouter un client</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4" noValidate>
        <div>
          <label className="block mb-1">Prénom</label>
          <input className="input" {...register('firstName')} />
          {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Nom</label>
          <input className="input" {...register('lastName')} />
          {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input type="email" className="input" {...register('email')} />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Envoi…' : 'Ajouter'}</button>
      </form>
    </section>
  );
}


