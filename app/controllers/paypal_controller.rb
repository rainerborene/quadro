class PaypalController < ApplicationController
  before_filter :authenticate_user!
  before_filter :get_subscription

  def checkout
    ppr = PayPal::Recurring.new({
      :return_url   => paypal_thank_you_path(:only_path => false),
      :cancel_url   => paypal_canceled_path(:only_path => false),
      :ipn_url      => paypal_ipn_path(:only_path => false),
      :description  => "Quadro - Monthly Subscription",
      :amount       => "5.00",
      :currency     => "USD"
    })

    response = ppr.checkout
    redirect_to response.valid?? response.checkout_url : paypal_canceled_path
  end

  def thank_you
    @subscription.update_attributes({ 
      :token => params[:token],
      :payer_id => params[:PayerID] 
    })
  end

  def payment
    ppr = PayPal::Recurring.new({
      :token       => params[:token],
      :payer_id    => params[:PayerID],
      :amount      => "5.00",
      :description => "Quadro - Monthly Subscription"
    })

    response = ppr.request_payment

    if response.approved? and response.completed?
      ppr = PayPal::Recurring.new({
        :amount      => "5.00",
        :currency    => "USD",
        :description => "Quadro - Monthly Subscription",
        :ipn_url     => paypal_ipn_path(:only_path => false),
        :frequency   => 1,
        :token       => params[:token],
        :period      => :monthly,
        :reference   => current_user.id.to_s,
        :payer_id    => params[:PayerID],
        :start_at    => Time.now,
        :failed      => 1,
        :outstanding => :next_billing
      })

      response = ppr.create_recurring_profile

      @subscription.update_attributes({
        :amount => response.amount,
        :profile_id => response.profile_id
      })

      return render "thank_you"
    end
  end

  def canceled
    render :text => "You've canceled the subscription."
  end

  def ipn
  end

  private

  def get_subscription
    current_user.subscription ||= Subscription.new
    @subscription = current_user.subscription
  end
end
