'use client';

import * as Form from '@radix-ui/react-form';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { FIELD_CLASS, FORM_ERROR_CLASS, LABEL_CLASS } from '@/app/components/ui/formStyles';
import Modal from '@/app/components/ui/Modal';
import PrimaryButton from '@/app/components/ui/PrimaryButton';
import StarRating from '@/app/components/ui/StarRating';
import { reviewFieldsSchema } from '@/lib/reviews';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSlug: string;
  productTitle: string;
  onSubmitted: () => void;
}

interface DraftPhoto {
  file: File;
  previewUrl: string;
}

type FieldErrors = Partial<Record<'reviewerName' | 'reviewerEmail' | 'comment', string>>;

export default function ReviewFormModal({
  isOpen,
  onClose,
  productSlug,
  productTitle,
  onSubmitted,
}: ReviewFormModalProps) {
  const t = useTranslations('reviews');
  const tField = useTranslations('fieldErrors');
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setRating(0);
    setName('');
    setEmail('');
    setComment('');
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setFieldErrors({});
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setPhotos((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function validateFields(): boolean {
    const result = reviewFieldsSchema.safeParse({
      reviewerName: name,
      reviewerEmail: email,
      comment,
    });
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (field === 'reviewerName') nextErrors.reviewerName = tField('nameInvalid');
        else if (field === 'reviewerEmail') nextErrors.reviewerEmail = tField('emailInvalid');
        else if (field === 'comment') nextErrors.comment = t('errorCommentInvalid');
      }
      setFieldErrors(nextErrors);
      return false;
    }
    setFieldErrors({});
    return true;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError(t('errorRatingRequired'));
      return;
    }
    if (!validateFields()) return;

    setSubmitting(true);

    const body = new FormData();
    body.set('productSlug', productSlug);
    body.set('rating', String(rating));
    body.set('reviewerName', name);
    body.set('reviewerEmail', email);
    body.set('comment', comment);
    photos.forEach((p) => body.append('photos', p.file));

    try {
      const res = await fetch('/api/reviews', { method: 'POST', body });
      if (!res.ok) {
        setError(t('errorSubmitFailed'));
        setSubmitting(false);
        return;
      }
      onSubmitted();
      handleClose();
    } catch {
      setError(t('errorSubmitFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel={t('writeReview')}
      dialogClassName="scrollbar-thin w-full max-w-lg max-h-[85vh] overflow-y-auto p-[clamp(24px,3vw,40px)]"
    >
      <h3 className="mb-1 text-[18px] leading-snug font-semibold tracking-[-0.02em] text-(--green-deep)">
        {t('writeReview')}
      </h3>
      <p className="text-ink-soft mb-5 text-[13px]">
        {t('forProduct')} <b className="text-(--green-deep)">{productTitle}</b>
      </p>

      <Form.Root onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.75">
          <span className={LABEL_CLASS}>{t('rating')}</span>
          <StarRating value={rating} onChange={setRating} size={28} label={t('rating')} />
        </div>

        <Form.Field
          name="name"
          serverInvalid={!!fieldErrors.reviewerName}
          className="flex flex-col gap-1.75"
        >
          <Form.Label className={LABEL_CLASS}>{t('yourName')}</Form.Label>
          <Form.Control asChild>
            <input
              type="text"
              autoComplete="name"
              placeholder={t('yourNamePlaceholder')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, reviewerName: undefined }));
              }}
              className={FIELD_CLASS}
            />
          </Form.Control>
          {fieldErrors.reviewerName && (
            <Form.Message className="text-[12px] text-red-500">
              {fieldErrors.reviewerName}
            </Form.Message>
          )}
        </Form.Field>

        <Form.Field
          name="email"
          serverInvalid={!!fieldErrors.reviewerEmail}
          className="flex flex-col gap-1.75"
        >
          <Form.Label className={LABEL_CLASS}>{t('email')}</Form.Label>
          <Form.Control asChild>
            <input
              type="text"
              autoComplete="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, reviewerEmail: undefined }));
              }}
              className={FIELD_CLASS}
            />
          </Form.Control>
          {fieldErrors.reviewerEmail && (
            <Form.Message className="text-[12px] text-red-500">
              {fieldErrors.reviewerEmail}
            </Form.Message>
          )}
        </Form.Field>

        <Form.Field
          name="comment"
          serverInvalid={!!fieldErrors.comment}
          className="flex flex-col gap-1.75"
        >
          <Form.Label className={LABEL_CLASS}>{t('comment')}</Form.Label>
          <Form.Control asChild>
            <textarea
              rows={4}
              placeholder={t('commentPlaceholder')}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setFieldErrors((prev) => ({ ...prev, comment: undefined }));
              }}
              className={`${FIELD_CLASS} resize-none`}
            />
          </Form.Control>
          {fieldErrors.comment && (
            <Form.Message className="text-[12px] text-red-500">{fieldErrors.comment}</Form.Message>
          )}
        </Form.Field>

        <div className="flex flex-col gap-1.75">
          <span className={LABEL_CLASS}>{t('photos')}</span>
          <div
            {...getRootProps()}
            className={`text-ink-soft flex w-full cursor-pointer items-center justify-center gap-2 border border-dashed px-3.5 py-4 text-center text-[12px] font-semibold tracking-[0.04em] uppercase transition-colors ${
              isDragActive
                ? 'border-(--green-deep) text-(--green-deep)'
                : 'border-line hover:border-(--green-deep)/50 hover:text-(--green-deep)'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? t('dropPhotoHere') : `+ ${t('addPhoto')}`}
          </div>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={p.previewUrl} className="relative">
                  {/* unoptimized: local blob preview URL, not fetchable by Next's image proxy */}
                  <Image
                    src={p.previewUrl}
                    alt=""
                    width={60}
                    height={60}
                    unoptimized
                    className="h-15 w-15 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-(--green-deep) text-[11px] text-white"
                    aria-label={t('removePhoto')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className={FORM_ERROR_CLASS}>{error}</p>}

        <PrimaryButton
          type="submit"
          disabled={submitting}
          loading={submitting}
          loadingText={t('submitting')}
          className="mt-1"
        >
          {t('submit')}
        </PrimaryButton>
      </Form.Root>
    </Modal>
  );
}
